// Import ExpressJS and enable CORS for cross-origin requests
// Allows the server to accept requests from different origins
import express, { Request, Response } from 'express';
import cors from 'cors';


// Initialize the Express application
const app = express();

// Set the backend port (use 5000 if nothing specified in env. variables)
const PORT = process.env.PORT || 5000;

/* Middleware:
* Enables CORS for all routes, which allows frontend applications on other domains to access this API.
* Parses incoming JSON requests and makes the data available in req.body.
* This is important for handling data sent in POST requests. */
app.use(cors());
app.use(express.json());

// Test API endpoint (GET)
app.get('/api/test', (req: Request, res: Response) => {
    res.json({ message: 'Hello from Express.js!' });
});

// Start the server: npx ts-node src/server.ts
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

