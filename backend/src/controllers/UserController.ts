// Model imports
import { User } from '../models/User';
// Services
import { checkIfUsernameExists, checkPassword, hashPassword, createUser } from '../services/RegistrationService'
import { getUser, validatePassword, generateToken } from '../services/AuthenticationService'
// Data Transfer Objects (DTOs)
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
    const credentials: Credentials = req.body; // Login credentials

    // Retrieve user from database: return error message if username is not found
    const {user, usernameError} = await getUser(credentials.username);
    if (!user) {
        return res.status(403).send(usernameError);
    }

    // Validate password: return error message if password is incorrect
    const {valid, validationError} = await validatePassword(user, credentials.password)
    if (!valid) {
        return res.status(403).send(validationError);
    }

    // Generate login token
    const {token, tokenError} = await generateToken(user.username);
    // Record server error if something goes wrong creating the token
    if (tokenError) {
        return res.status(500).send("Server error: " + tokenError);
    }
    // If successful, return token back to client
    return res.status(200).send({ token });
})

export default router;

