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
import mainRouter from './controllers/ChatController';

// Important services
import { getRecentMessages, getMessageCount, checkForAccount, newMessage } from './services/MessageService';

// Important objects
import { ClientMessage }  from './dto/messaging/ClientMessage';
import { ServerMessage }  from './dto/messaging/ServerMessage';
import { Message }  from './models/Message';

// Initialize the Express application
const app = express();
// Initialize server socket
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
// Set the server port (use 8080 if nothing specified in .env variables)
const PORT = Number(process.env.SERVER_PORT) ?? 8080;
// Set the client URL
const CLIENT = process.env.CLIENT_URL ?? 'http://localhost:5173';

// Enable CORS for cross-origin requests: allows the server to accept requests from different origins
app.use(cors({ origin: CLIENT, credentials: true }));
app.use(express.json()); // Allow sending JSON responses
app.use(cookieParser()); // Allow processing of cookies

// Import API routes from controllers
app.use('/api/auth', authRouter);
app.use('/api/chat', mainRouter);

// Test API endpoint (GET)
app.get('/api/test', (req: Request, res: Response) => {
    res.json({ message: 'Hello from Express.js!'});
});

// Server main function
const main = async () => {
    try {
        // Test database connection
        await testConnection();
        // If successful, start the server
        console.log("Starting server...");
        const server = httpServer.listen(PORT, () =>
            console.log(`Server is running on http://localhost:${PORT}`)
        );

        let clientCounter = 0;
        let prevSenderID = 0; 
        let prevSenderName = '';
        let msgCounter = await getMessageCount() ?? 0;

         // Start listening for clients (they can only join after logging in)
        io.on("connection", async (socket) => {
            clientCounter++;
            console.log("New connection established.", clientCounter, "clients currently connected.");

            // Temporary solution to test if fetching from DB works.
            try {
                // Retrieve last 100 messages from the database
                const recentMessageList = await getRecentMessages(100);
                if (recentMessageList == null) {
                    console.log("Failed to fetch recent messages from the database");
                } else {
                    // Convert each Message into a ServerMessage
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
                        let msgType = 2;    
                        if (msg.prevSender) {
                            msgType = (msg.sender.id == msg.prevSender.id) ? 1 : 2;
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
                        // console.log("Message ID", msg.id);
                        // console.log(msgFromDB);
                        // Broadcast ONLY to the new client that joined
                        socket.emit("message", msgFromDB);
                    }
                    console.log("Recent messages sent over");
                }
            } catch (error) {
                console.error("Failed to process message list:", error);
            }
        
            // Listen for messages
            socket.on("message", async (msg: ClientMessage) => {
                try {
                    console.log("Message received:", msg.text, "from", msg.senderName);

                    // msgType 0 is for system messages
                    let msgType = 2;

                    // Verify that the account exists
                    const accountExists = checkForAccount(msg.senderID);
                    if (!accountExists) {
                        // If the account somehow doesn't exist, send a system message?
                        console.error("Account couldn't be verified.");
                    } else {
                        msgCounter++;
                        // 1 = Message has same sender as the previous one, 2 = Message has different sender
                        msgType = (msg.senderID == prevSenderID) ? 1 : 2;

                        // Broadcast to all connected clients (including sender)
                        const serverMessage: ServerMessage = {
                            id: msgCounter, 
                            socket: socket.id,
                            msgType: msgType,  
                            senderID: msg.senderID,
                            senderName: msg.senderName, 
                            text: msg.text, 
                            timestamp: new Date(), 
                            profilePicture: '',
                        };
                        io.emit("message", serverMessage);

                        // Add message to database
                        const messageStored = await newMessage(serverMessage, prevSenderID);
                        if (!messageStored) {
                            console.log("Note: Failed to store message #", msgCounter, "in the database.");
                        }

                        // Update previous sender info to use for the next message
                        prevSenderID = msg.senderID;
                        prevSenderName = msg.senderName;
                    }

                } catch (error) {
                    console.error("Unexpected error while sending message: ", error);
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                clientCounter--;
                console.log("A client disconnected.", clientCounter, "clients currently connected.");
            });
        });

        // Handle shutdown of the server
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