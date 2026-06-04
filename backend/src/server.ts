// Import ExpressJS and enable CORS for cross-origin requests
// Allows the server to accept requests from different origins
import express, { Request, Response } from 'express';
import cors from 'cors';
// Load environment variables from .env file
import 'dotenv/config';
// Import database connection functions
import { testConnection, testData, shutdownPool } from './db';
// Import router functions from controllers
import authRouter from './controllers/AuthController';

// Initialize the Express application
const app = express();

// Set the backend port (use 8080 if nothing specified in .env variables)
const PORT = Number(process.env.SERVER_PORT) || 8080;

/* Middleware:
* Enables CORS for all routes, which allows frontend applications on other domains to access this API.
* Parses incoming JSON requests and makes the data available in req.body.
* This is important for handling data sent in POST requests. */
app.use(cors());
app.use(express.json());

// Import API routes from controllers
app.use('/api/auth', authRouter);

// Test API endpoint (GET)
app.get('/api/test', (req: Request, res: Response) => {
    res.json({ message: 'Hello from Express.js! Look, it\'s the server!' });
});

// Server main function
const main = async () => {
    try {
        // Test database connection
        await testConnection();
        await testData();
        // If successful, start the server
        console.log("Starting server...");
        const server = app.listen(PORT, () =>
            console.log(`Server is running on http://localhost:${PORT}`)
        );

        // Handle graceful shutdown
        const shutdown = async () => {
            console.log('Shutting down server...');
            server.close(async () => {
                await shutdownPool(); // Close database pool
                console.log('Server shutdown complete.');
                process.exit(0); // Terminate process
            });
        };
        // Call shutdown function on termination signals
        process.on('SIGINT', shutdown); // Handles Ctrl+C in terminal
        process.on('SIGTERM', shutdown); // Handles other termination signals
        
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1); // Exit with error code
    }
};

// call with "npx ts-node src/server.ts" in terminal
main();