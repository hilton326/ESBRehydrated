// Import ExpressJS and enable CORS for cross-origin requests
// Allows the server to accept requests from different origins
import express, { Request, Response } from 'express';
import cors from 'cors';

// Import router functions from controllers
import userRouter from './controllers/UserController';

// Initialize the Express application
const app = express();

// Set the backend port (use 8080 if nothing specified in env. variables)
const PORT = process.env.PORT || 8080;

/* Middleware:
* Enables CORS for all routes, which allows frontend applications on other domains to access this API.
* Parses incoming JSON requests and makes the data available in req.body.
* This is important for handling data sent in POST requests. */
app.use(cors());
app.use(express.json());

// Routes for API controllers
app.use('/api/users', userRouter);

// Test API endpoint (GET)
app.get('/api/test', (req: Request, res: Response) => {
    res.json({ message: 'Hello from Express.js!' });
});

// Start the server: npx ts-node src/server.ts
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

