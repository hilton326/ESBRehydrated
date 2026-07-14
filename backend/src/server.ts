// MAIN SERVER
import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config'; // Load environment variables from .env file
import { testConnection, shutdownPool } from './db'; // database connection functions

// Router functions from controllers
import authRouter from './controllers/AuthController';
//import profileRouter from './controllers/ProfileController';

// Important services
import { buildRecentMsgList, getMessageCount, prepareMessage, storeMessage } from './services/MessageService';
import { verifyToken } from "./services/MiddlewareService"; // middleware function

// Important objects
import { ClientMessage }  from './types/MessageTypes';
import { ServerMessage }  from './types/MessageTypes';
import { AccountInfo } from './types/AccountTypes';

// Initialize the Express application
const app = express();
// Set the server port (use 8080 if nothing specified in .env variables)
const PORT = Number(process.env.SERVER_PORT) ?? 8080;
// Set the client URL
const CLIENT = process.env.CLIENT_URL ?? 'http://localhost:5173';

// Enable CORS for cross-origin requests: allows the server to accept requests from different origins
app.use(cors({ origin: CLIENT, credentials: true }));
app.use(express.json()); // Allow sending JSON responses

// Allow processing of cookies
app.use(cookieParser()); 
const cookie = require('cookie');
//console.log("cookie keys:", Object.keys(cookie));

// Initialize server socket
const httpServer = http.createServer(app);
// Also configure CORS for socket.io
const io = new Server(httpServer, { cors: { origin: CLIENT, credentials: true } });

// Import API routes from controllers
app.use('/api/auth', authRouter);
//app.use('/api/chat', mainRouter);

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
        // # of clients connected and list of connected clients
        let clientList: AccountInfo[] = [];
        // Keep track of the sender of the previous message (used for determining message display type)
        let prevSenderID = 0;
        // Set the next message ID based on the # of messages in the database
        let msgCounter = await getMessageCount() ?? 1; 
        
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
                    return;
                }
                // Retrieve JWT token from cookie
                const cookies = cookie.parseCookie(cookieHeader);
                const token = cookies["auth_token"];
                if (!token) {
                    console.log("Unauthorized: token not present");
                    return;
                }
                // Call the middleware service to verify the token
                const authData = await verifyToken(token);
                if (!authData.account) {
                    console.log("Unauthorized: invalid token");
                    return;
                }
                // Attach authenticated user and continue
                socket.data.client = authData.account; 
                console.log("Account", socket.data.client.id, "is verified");
                return next();
            } catch (error) {
                console.error("Unauthorized: invalid token;", error);
                return;
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
            console.log("New client", currentClient.name, "authorized.");

            /* Make sure the client is not already present before adding it to the list.
            * This stops the client from occasionally being added twice when they refresh their chat. */
            let notPresent = true;
            clientList.forEach(client => {
                if (client.id === currentClient.id) {
                    console.log("Connection Notice:", currentClient.name, "is already in the list.");
                    notPresent = false;
                }
            })
            if (!notPresent) return;

            // Add the new client to the list
            clientList.push({id: currentClient.id, name: currentClient.name, profilePicture: currentClient.profilePicture ?? ''});
            // Broadcast the new client's information to all other clients
            customIoEmit("clients:add", currentClient, socket.id);
            // Send entire list to new client
            socket.emit("clients:init", clientList);
            console.log(socket.data.client.name, "has joined.", clientList.length, "clients currently connected.");
            
            // Fetch recent messages from database (so the new client may see them)
            try {
                // Retrieve last 100 messages from the database
                const recentMessageList = await buildRecentMsgList(100);
                if (recentMessageList == null) {
                    console.log("Failed to fetch recent messages from the database");
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
                            console.log("Skipping message ", msg.id, ". Sender couldn't be verified.");
                            continue;
                        }
                        // Check if previous sender is defined
                        let psender = 0;
                        if (msg.prevSender) {
                            psender = msg.prevSender.id;
                        }
                        const msgFromDB: ServerMessage = prepareMessage(msg.id, msg.text, socket.id, msg.sender.id, msg.sender.name, msg.sender.profilePicture ?? '', psender, msg.timestamp);
                        socket.emit("message", msgFromDB);
                    }
                    console.log("Recent messages sent over");
                }
            } catch (error) {
                console.error("Failed to process message list:", error);
            }

            // Broadcast a system message to alert everyone of the new person joining
            msgCounter++;
            const joinText = "~ " + currentClient.name + " has entered the Krusty Krab. ~";
            const joinMsg: ServerMessage = prepareMessage(msgCounter, joinText, socket.id, 0, "System", "", prevSenderID, String(new Date()));
            io.emit("message", joinMsg);

            // Add message to database
            const messageStored = await storeMessage(joinMsg, prevSenderID);
                if (!messageStored) {
                    console.log("Failed to store message #", msgCounter, "in the database.");
                }

            // Reset previous sender ID to 0
            prevSenderID = 0;
            
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
                        msgCounter++;
                        console.log("Message received:", msg.text, "from", currentClient.name);

                        // Broadcast message to all clients (including sender)
                        const message: ServerMessage = prepareMessage(msgCounter, msg.text, socket.id, currentClient.id, currentClient.name, currentClient.profilePicture ?? '', prevSenderID, String(new Date()));
                        io.emit("message", message);

                        // Add message to database
                        const messageStored = await storeMessage(message, prevSenderID);
                            if (!messageStored) {
                                console.log("Failed to store message #", msgCounter, "in the database.");
                            }
                        // Update previous sender info to use for the next message
                        prevSenderID = currentClient.id ?? msg.senderID;
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
                console.log(currentClient.name, "has requested to leave.");

                // Delete client from list and signal clients to update their displays
                clientList = clientList.filter(client => client.id !== currentClient.id);
                customIoEmit("clients:remove", currentClient, "");
                console.log(socket.data.client.name, "has left.", clientList.length, "clients currently connected.");

                msgCounter++;
                // Broadcast a system message to alert everyone of the new person leaving
                const leaveText = "~ " + currentClient.name + " has left the Krusty Krab. ~";
                const leaveMsg: ServerMessage = prepareMessage(msgCounter, leaveText, socket.id, 0, "System", "", prevSenderID, String(new Date()));
                io.emit("message", leaveMsg);

                // Add message to database
                const messageStored = await storeMessage(leaveMsg, prevSenderID);
                    if (!messageStored) {
                        console.log("Failed to store message #", msgCounter, "in the database.");
                    }
                // Reset previous sender ID to 0
                prevSenderID = 0;
            });
        });

        /* *****************************************************************
        * SERVER SHUTDOWN
        * Handle shutdown of the server */
        const shutdown = async () => {
            // Make sure shutdown isn't triggered more than once
            if (shuttingDown) return;
            shuttingDown = true;
            console.log('Shutting down server...');
            try {
                // Stop accepting new web socket connections
                await io.close();
                // Close HTTP server
                server.close();
                // Close database pool
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

// call with "npx ts-node src/server.ts" in terminal
main();