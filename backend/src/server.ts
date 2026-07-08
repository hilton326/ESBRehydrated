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
import { getRecentMessages, getMessageCount, checkForAccount, newMessage } from './services/MessageService';
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
const main = async () => {
    try {
        /* *****************************************************************
        * SERVER STARTUP
        * Test database connection and start if successful */
        await testConnection();
        console.log("Starting server...");
        const server = httpServer.listen(PORT, () =>
            console.log(`Server is running on http://localhost:${PORT}`)
        );

        /* *****************************************************************
        * Global Functions & Variables */ 

        // # of clients connected and list of connected clients
        let clientCounter = 0;
        let clientList: AccountInfo[] = [];
        // Keep track of the sender of the previous message (used for determining message display type)
        let prevSenderID = 0;
        let prevSenderName = '';
        // Set the next message ID based on the # of messages in the database
        let msgCounter = await getMessageCount() ?? 0; 

        // Customizable emit function: Best used for excluding specific sockets from an io.emit broadcast
        const customIoEmit = (identifier: string, data: any, exceptSocketId: string) => {
            if (exceptSocketId) {
                for (const [socketId, socket] of io.sockets.sockets.entries()) {
                    if (socketId === exceptSocketId) continue;
                    socket.emit(identifier, data);
                }
            } else {
                io.emit(identifier, data);
            }
        };

        // Quickly determine message type, which is needed for the client to figure out how to display it
        const assignMsgType = (sender: number, prevSender: number ) => {
            // Type 0 = System message (primarily used for join and leave logs). No sender data is associated.
            if (sender == 0) return 0;

            // Type 1 = Message has different sender from previous, so it has full sender info
            // Type 2 = Message has same sender as previous, so it has less info
            const msgType = (sender != prevSender) ? 1 : 2;
            return msgType;
        }

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

                // Attach authenticated user
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
            // Verify that the new client is authorized
            const client = socket.data.client;
            if (!client) return;
            clientCounter++;
            console.log(socket.data.client.name, "has joined.", clientCounter, "clients currently connected.");

            // Update socket list to include new client
            clientList.push({id: client.id, name: client.name, profilePicture: client.profilePicture ?? ''});

            // Send entire list to new client, then broadcast new client info to other clients
            socket.emit("clients:init", clientList);
            customIoEmit("clients:add", client, socket.id);

            // Fetch recent messages from database (so the new client may see them)
            try {
                // Retrieve last 100 messages from the database
                const recentMessageList = await getRecentMessages(100);
                if (recentMessageList == null) {
                    console.log("Failed to fetch recent messages from the database");
                } else {
                    // Convert each Message model into a ServerMessage DTO (expected by client)
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
                        // Determine message type using previous sender info
                        let msgType = 1;    
                        if (msg.prevSender) {
                            msgType = assignMsgType(msg.sender.id, msg.prevSender.id);
                        }

                        const msgFromDB: ServerMessage = {
                            id: msg.id, 
                            socket: socket.id,
                            msgType: msgType, 
                            senderID: msg.sender.id,
                            senderName: msg.sender.name, 
                            text: msg.text, 
                            timestamp: msg.timestamp, 
                            profilePicture: '',
                        };
                        
                        // Send ONLY to the new client that joined
                        socket.emit("message", msgFromDB);
                    }
                    console.log("Recent messages sent over");
                }
            } catch (error) {
                console.error("Failed to process message list:", error);
            }

            msgCounter++;
            // Broadcast a system message to alert everyone of the new person joining
            const joinMsg: ServerMessage = {
                id: msgCounter,
                socket: socket.id,
                msgType: 0,
                senderID: 0, 
                senderName: "System",
                text: "~ " + client.name + " has entered the Krusty Krab. ~",
                timestamp: new Date(),
                profilePicture: ''
            };
            io.emit("message", joinMsg);

            // Add message to database
            const messageStored = await newMessage(joinMsg, prevSenderID);
            if (!messageStored) {
                console.error("Failed to store message #", msgCounter, "in the database.");
            }

            // Reset previous sender ID to 0
            prevSenderID = 0;
            
            /* *****************************************************************
            * On new message
            */
            socket.on("message", async (msg: ClientMessage) => {
                try {
                    // If user isn't authenticated, do not proceed
                    if (!client) {
                        return;

                    } else {
                        // Get sender information from the authentication check
                        let senderID = client.id;
                        let senderName = client.name;
                        if (!senderID || !senderName) {
                            console.log("Note: couldn't retrieve authenticated user info. Falling back to info sent from client.")
                            senderID = msg.senderID;
                            senderName = msg.senderName;
                        }

                        // Increment message ID counter
                        console.log("Message received:", msg.text, "from", senderName);
                        msgCounter++;

                        // Assign the message type
                        const msgType = assignMsgType(senderID, prevSenderID);

                        // Broadcast to all connected clients (including sender)
                        const serverMessage: ServerMessage = {
                            id: msgCounter, 
                            socket: socket.id,
                            msgType: msgType,  
                            senderID: senderID,
                            senderName: senderName,
                            text: msg.text, 
                            timestamp: new Date(), 
                            profilePicture: client.profilePicture ?? '',
                        };
                        io.emit("message", serverMessage);

                        // Add message to database
                        const messageStored = await newMessage(serverMessage, prevSenderID);
                        if (!messageStored) {
                            console.error("Failed to store message #", msgCounter, "in the database.");
                        }

                        // Update previous sender info to use for the next message
                        prevSenderID = senderID;
                        prevSenderName = senderName;
                    }

                } catch (error) {
                    console.error("Unexpected error while sending message: ", error);
                }
            });

            /* *****************************************************************
            * On user disconnection
            */
            socket.on('disconnect', async () => {
                if (!client) return;

                clientCounter--;
                console.log(socket.data.client.name, "left.", clientCounter, "clients currently connected.");

                // Delete client from list
                const i = clientList.indexOf(client);
                clientList.splice(i, 1);
                customIoEmit("clients:remove", client, "");

                msgCounter++;
                // Broadcast a system message to alert everyone of the new person joining
                const leaveMsg: ServerMessage = {
                    id: msgCounter,
                    socket: socket.id,
                    msgType: 0,
                    senderID: 0, 
                    senderName: "System",
                    text: "~ " + socket.data.client.name + " has left the Krusty Krab. ~",
                    timestamp: new Date(),
                    profilePicture: ''
                };
                io.emit("message", leaveMsg);

                // Add message to database
                const messageStored = await newMessage(leaveMsg, prevSenderID);
                if (!messageStored) {
                    console.error("Failed to store message #", msgCounter, "in the database.");
                }
                // Reset previous sender ID to 0
                prevSenderID = 0;
            });
        });

        /* *****************************************************************
        * SERVER SHUTDOWN
        * Handle shutdown of the server */
        let shuttingDown = false;
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