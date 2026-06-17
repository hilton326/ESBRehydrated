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

// Data transfer objects
import { ClientMessage }  from './dto/messaging/ClientMessage';
import { ServerMessage }  from './dto/messaging/ServerMessage';

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

        // Start listening for clients (they can only join after logging in)
        io.on("connection", (socket) => {
            // Listen for messages
            socket.on("message", (msg: ClientMessage) => {
                console.log("Message received: ", msg.text);
                console.log("from ", msg.sender);
                const time = Date.now();
                // Broadcast to all connected clients (including sender)
                io.emit("message", { from: socket.id, name: msg.sender, text: msg.text, timestamp: time });
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log('A user disconnected');
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