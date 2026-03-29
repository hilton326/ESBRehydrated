// Express.js imports
import { Router, Request, Response } from 'express';
const router = Router();
// Model imports
import { User } from '../models/User';
// Services
import { checkIfUsernameExists, checkPassword, hashPassword, createNewUser } from '../services/RegistrationService'
import { findUser, validatePassword, generateToken } from '../services/AuthenticationService'
// Data Transfer Objects (DTOs)
import { RegistrationForm } from '../dto/users/RegistrationForm';
import { LoginCredentials } from '../dto/users/LoginCredentials';

// User registration
router.post('/register', async (req: Request, res: Response) => {
    const credentials: RegistrationForm = req.body;

    // Make sure credentials are not empty
    if (!credentials) {
        return res.status(403).send("Please fill out all required fields.");
    }
    if (!credentials.email || !credentials.username || !credentials.password) {
        return res.status(403).send("Please fill out all required fields.");
    }

    // Make sure the username isn't already registered with another account
    const existingUserCheck = await checkIfUsernameExists(credentials.username);
    if (existingUserCheck.exists) {
        return res.status(existingUserCheck.code).send(existingUserCheck.error);
    }

    // Hash password for security
    const hashedPasswordResponse = await hashPassword(credentials.password);
    if (hashedPasswordResponse.error) {
        return res.status(hashedPasswordResponse.code).send(hashedPasswordResponse.error);
    }

    // Create the user in the database
    const newUserResponse = await createNewUser(credentials.email, credentials.username, hashedPasswordResponse.password);
    // If the new ID is -1, something went wrong
    if (newUserResponse.id == -1) {
        return res.status(500).send(newUserResponse);
    }
    return res.status(201).send(newUserResponse);
})

// Logging in
router.post('/login', async (req: Request, res: Response) => {
    const credentials: LoginCredentials = req.body; // Login credentials
    
    // Make sure credentials are not empty
    if (!credentials) {
        return res.status(403).send("Username and password are required.");
    }
    if (!credentials.email || !credentials.password) {
        return res.status(403).send("Username and password are required.");
    }

    // Retrieve user from database: return error message if username is not found
    const userCheck = await findUser(credentials.email);
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

