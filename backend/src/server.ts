// MAIN SERVER APPLICATION
console.log("Initializing...");

import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io'; // Chat server
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config'; // Load environment variables from .env file
import { testConnection, shutdownPool } from './db'; // database connection functions

// Router functions from controllers
import authRouter from './controllers/AuthController';
import accountRouter from './controllers/AccountController';

// Important services
import { buildRecentMsgList, getMessageCount, prepareMessage, storeMessage } from './services/MessageService';
import { verifyToken } from "./services/MiddlewareService"; 
import { initSocket } from './services/SocketEventService';

// Important object types
import { ClientMessage, ServerMessage } from './types/MessageTypes';
import { AccountInfo } from './types/AccountTypes';

// Initialize the Express application
const app = express();
// Set the server port (use 8080 if nothing specified in .env variables)
const PORT = Number(process.env.SERVER_PORT) ?? 8080;

// CORS control function
function corsOrigin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);

    /* Test the origin of the request:
    * https?:\/\/ - either "http://" or "https://"
    * (localhost|127\.0\.0\.1): - either localhost or its IP address representation
    * \d+ - Finally, any forwarded port number
    */
    if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true);
    return callback(null, false);
}

// Enable CORS for cross-origin requests: allows the server to accept requests from different origins
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json()); // Allow sending JSON responses

// Allow processing of cookies
app.use(cookieParser()); 
const cookie = require('cookie');
//console.log("cookie keys:", Object.keys(cookie));

// Initialize server socket
const httpServer = http.createServer(app);
// Also configure CORS for socket.io
const io = new Server(httpServer, { cors: { origin: corsOrigin, credentials: true } });
// Pass the server instance into the SocketEventService to allow other controllers/services to use it
initSocket(io);

// Import API routes from controllers
app.use('/api/auth', authRouter);
app.use('/api/account', accountRouter);

// Test API endpoint (GET)
app.get('/api/test', (req: Request, res: Response) => {
    res.json({ message: 'Hello from Express.js!'});
});

// Server main function
async function main() {
    try {
        /* *****************************************************************
        * SERVER STARTUP
        * Test database connection and start if successful */
        await testConnection();
        console.log("Starting server...");
        const server = httpServer.listen(PORT, () =>
            console.log(`Server is running on http://localhost:${PORT}`)
        );
        // Shutdown state. Do not try to perform any other actions during shutdown.
        let shuttingDown = false;

        /* *****************************************************************
        * Global Functions & Variables */ 

        let clientList: AccountInfo[] = []; // # of clients connected and list of connected clients
        let msgCounter = await getMessageCount(); // Set the next message ID based on the # of messages in the database
        
        // Customizable emit function: Best used for excluding specific sockets from an io.emit broadcast
        const customIoEmit = (action: string, data: any, exceptSocketId: string) => {
            for (const [socketId, socket] of io.sockets.sockets.entries()) {
                if (exceptSocketId) {
                    if (socketId === exceptSocketId) continue;
                }
                socket.emit(action, data);
                // console.log("Sent", data, "to", socket.data.client.name, "during", action);
            }
        };

        /* *****************************************************************
        * Authenticate using cookie for every incoming socket connection
        * If this check fails, the client cannot connect
        */
        io.use(async (socket, next) => {
            try {
                // Locate the cookie
                const cookieHeader = socket.handshake.headers.cookie;
                if (!cookieHeader) {
                    console.log("Unauthorized: cookie not present");
                    return next(new Error("Unauthorized"));
                }
                // Retrieve JWT token from cookie
                const cookies = cookie.parseCookie(cookieHeader);
                const token = cookies["auth_token"];
                if (!token) {
                    console.log("Unauthorized: token not present");
                    return next(new Error("Unauthorized"));
                }
                // Call the middleware service to verify the token
                const authData = await verifyToken(token);
                if (!authData.account) {
                    console.log("Unauthorized: invalid token");
                    return next(new Error("Unauthorized"));
                }
                // Attach authenticated user and continue
                socket.data.client = {account: authData.account, /*profilePicture: null*/}; 
                console.log("Account", socket.data.client.account.id, "is verified");
                return next();
        
            } catch (error) {
                console.error("Unauthorized: invalid token;", error);
                return next(new Error("Unauthorized"));
            }
        });

        /* *****************************************************************
        * On new client connection (they can only join after logging in)
        */
        io.on("connection", async (socket) => {
            if (shuttingDown) return;

            // Verify that the new client is authorized (has an active login session)
            const currentClient = socket.data.client;
            if (!currentClient) return;
            console.log("New client", currentClient.account.name, "authorized.");

            /* Make sure the client is not already present before adding it to the list.
            * This stops the client from occasionally being added twice when they refresh their chat. 
            * Also, if this is a duplicate session, emit a special signal to the client. */
            let notPresent = true;
            clientList.forEach(client => {
                if (client.id === currentClient.account.id) {
                    console.log("Connection Notice:", currentClient.account.name, "is already in the list.");
                    notPresent = false;
                }
            })
            if (!notPresent) {
                socket.emit("duplicate");
                return;
            }

            /* Add new client data to clientList:
            * Broadcast the entire clientList to the new client.
            * But only broadcast the newClientData to all other clients. */
            const newClientData = {id: currentClient.account.id, name: currentClient.account.name};
            clientList.push(newClientData); 
            socket.emit("clients:init", clientList);
            customIoEmit("clients:add", newClientData, socket.id);
            console.log(currentClient.account.name, "has joined.", clientList.length, "clients currently connected.");
            
            // Fetch recent messages from database (so the new client may see them)
            try {
                // Retrieve last {count} messages from the database (count can be any integer)
                const recentMessageList = await buildRecentMsgList(500);
                if (recentMessageList == null) {
                    throw new Error("Failed to fetch recent messages from the database");
                } else {
                    // Send in reverse order so they display oldest to newest
                    for (let i = recentMessageList.length - 1; i >= 0; i--) {
                        const msg = recentMessageList[i];
                        // Make sure the message exists
                        if (!msg) {
                            console.log("No", i, "th message found");
                            continue;
                        }
                        // If there is no sender, skip this message
                        if (!msg.sender) {
                            console.log(`Skipping message ${msg.id}. Sender couldn't be verified.`);
                            continue;
                        }
                        const msgFromDB = await prepareMessage(msg.id, msg.text, msg.sender.id, msg.sender.name, msg.timestamp, msg.type);
                        if (!msgFromDB) {
                            console.log(`Failed to prepare message ${msg.id}`);
                            continue;
                        }
                        // Send a distinct signal for "old messages"
                        socket.emit("old-message", msgFromDB);
                    }
                    console.log(`Recent messages sent to ${currentClient.account.name}`);
                }
            } catch (error) {
                console.error(`Failed to process message list: ${error}`);
            }

            // Broadcast a system message to alert everyone of the new person joining
            msgCounter = await getMessageCount();
            const joinText = "~ " + currentClient.account.name + " has entered the Krusty Krab. ~";
            const joinMsg = await prepareMessage(msgCounter, joinText, 0, "System", String(new Date()), 0);
            if (joinMsg) {
                io.emit("message", joinMsg);

                // Add message to database
                const messageStored = await storeMessage(joinMsg);
                if (!messageStored) {
                    console.warn("Failed to store message #", msgCounter, "in the database.");
                }
            }

            /* *****************************************************************
            * On new message
            */
            socket.on("message", async (msg: ClientMessage) => {
                if (shuttingDown) return;
                try {
                    // If user isn't authenticated, do not proceed
                    if (!currentClient) {
                        return;
                    } else {
                        // Increment message ID counter
                        msgCounter = await getMessageCount();
                        console.log("Message received:", msg.text, "from", currentClient.account.name);

                        // Prepare message for sending
                        // NOTE: "null" argument is msgType. This is unknown now but prepareMessage calculates it.
                        const message = await prepareMessage(
                            msgCounter, msg.text, currentClient.account.id, currentClient.account.name, String(new Date()), null
                        );
                        if (message) {
                             // Broadcast message to all clients (including sender)
                            io.emit("message", message);

                            // Add message to database
                            const messageStored = await storeMessage(message);
                                if (!messageStored) {
                                    console.warn("Failed to store message #", msgCounter, "in the database.");
                                }
                        }
                    }
                } catch (error) {
                    console.error("Unexpected error while sending message: ", error);
                }
            });

            /* *****************************************************************
            * On user disconnection
            */
            socket.on('disconnect', async () => {
                if (!currentClient) return;
                if (shuttingDown) return;
                console.log(currentClient.account.name, "has requested to leave.");

                // Delete client from list and signal clients to update their displays
                clientList = clientList.filter(client => client.id !== currentClient.account.id);
                const clientToRemove = {id: currentClient.account.id, name: currentClient.account.name, /*profilePicture: currentClient.profilePicture ?? null*/};
                customIoEmit("clients:remove", clientToRemove, "");
                console.log(currentClient.account.name, "has left.", clientList.length, "clients currently connected.");

                msgCounter = await getMessageCount();
                // Broadcast a system message to alert everyone of the new person leaving
                const leaveText = "~ " + currentClient.account.name + " has left the Krusty Krab. ~";
                const leaveMsg = await prepareMessage(msgCounter, leaveText, 0, "System", String(new Date()), 0);

                if (leaveMsg) {
                    io.emit("message", leaveMsg);

                    // Add message to database
                    const messageStored = await storeMessage(leaveMsg);
                        if (!messageStored) {
                            console.warn("Failed to store message #", msgCounter, "in the database.");
                        }
                }
            });
        });

        /* *****************************************************************
        * SERVER SHUTDOWN
        * Handle shutdown of the server */
        const shutdown = async () => {
            if (!server) return; // Ensure there is a server running
            if (shuttingDown) return; // Ensure shutdown isn't triggered more than once
            shuttingDown = true;
            console.log('Shutting down server...');
            try {
                // Stop accepting new web socket connections
                await io.close();
                
                // Close HTTP server and database pool
                server.close(); 
                await shutdownPool(); 

                console.log('Server shutdown complete.');
                process.exit(0); // Terminate process
            } catch (error) {
                console.error("Error during server shutdown: ", error);
                process.exit(1);
            }
        };
        // Call shutdown function on termination signals
        process.on('SIGINT', shutdown); // Handles Ctrl+C in terminal
        process.on('SIGTERM', shutdown); // Handles other termination signals
        
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1); // Exit with error code
    }
};

main(); // call with "npx ts-node src/server.ts" in terminal