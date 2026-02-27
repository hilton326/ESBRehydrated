import { User } from '../models/User';
import { checkIfUsernameExists, validatePassword, hashPassword, createUser } from '../services/RegistrationService'
import { Credentials } from '../dto/users/Credentials';

import { Router, Request, Response } from 'express';
const router = Router();

// User registration
router.post('/register', async (req: Request, res: Response) => {
    const credentials: Credentials = req.body;

    // Make sure credentials are not empty
    if (!credentials.username || !credentials.password) {
        return res.status(400).send("Username and password are required.");
    }
    // Make sure the username is not taken
    const existingUser = await checkIfUsernameExists(credentials.username);
    if (existingUser) {
        return res.status(400).send("User name already taken.")
    }

    try {
        // Hash password for security
        const hashedPassword = await hashPassword(credentials.password);
        // Create the user in the database
        const response = await createUser(credentials.username, hashedPassword);
        res.status(201).send(response)
    } catch (error) {
        return res.status(500).send('Error when hashing password')
    }
})

// Logging in
router.post('/login', async (req: Request, res: Response) => {
    const credentials: Credentials = req.body;
    // WIP
})

export default router;

