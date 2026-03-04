// Express.js imports
import { Router, Request, Response } from 'express';
const router = Router();
// Model imports
import { User } from '../models/User';
// Services
import { checkIfUsernameExists, checkPassword, hashPassword, createNewUser } from '../services/RegistrationService'
import { findUser, validatePassword, generateToken } from '../services/AuthenticationService'
// Data Transfer Objects (DTOs)
import { Credentials } from '../dto/users/Credentials';

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
        const response = await createNewUser(credentials.username, hashedPassword);
        res.status(201).send(response)
    } catch (error) {
        return res.status(500).send('Error when hashing password')
    }
})

// Logging in
router.post('/login', async (req: Request, res: Response) => {
    const credentials: Credentials = req.body; // Login credentials

    // Retrieve user from database: return error message if username is not found
    const userCheck = await findUser(credentials.username);
    if (!userCheck.user) {
        return res.status(userCheck.code).send(userCheck.error);
    }
    const currentUser = userCheck.user;

    // Validate password: return error message if password is incorrect
    const passwordCheck = await validatePassword(currentUser, credentials.password)
    if (!passwordCheck.valid) {
        return res.status(passwordCheck.code).send(passwordCheck.error);
    }

    // Generate login token
    const loginToken = await generateToken(currentUser);
    // Record server error if something goes wrong creating the token
    if (loginToken.error) {
        return res.status(500).send("Server error when creating login token: " + loginToken.error);
    }
    // If successful, return token back to client
    const token = loginToken.token;
    return res.status(200).send({ token });
})

export default router;

