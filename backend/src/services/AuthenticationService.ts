import { User } from '../models/User';
// Replace with database
import { userList } from './RegistrationService';

// Get this from env variables
const secretKey = 'my_secret_key';

// Used to encrypt passwords
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Function to check if there is a user in the database with the entered username
function findUser(inputUsername: string) {
    try {
        // Retrieve user from database
        const user = userList.find(user => user.username === inputUsername);

        // Return user if found; if not, return null
        // Also return status and error message if applicable
        const response = user 
            ? {user: user, code: 200, error: null} 
            : {user: null, code: 404, error: "Username not found. Have you created an account?"};
        return response;

    } catch (serverError) {
        return {user: null, code: 500, error: serverError};
    }
}

// Function to check if the entered password is correct
async function validatePassword(user: User, inputPassword: string) {
    try {
        // Check if the entered password matches the user's password from the database
        const valid = await bcrypt.compare(inputPassword, user.password);

        // Return true if the password is valid; false if not
        // Also return status and error message if applicable
        const response = valid
            ? {valid: true, code: 200, error: null} 
            : {valid: false, code: 403, error: "Incorrect password."};
        return response;

    } catch (serverError) {
        return {valid: false, code: 500, error: serverError};
    }
}

// Function to generate a session token (once credentials have been validated) 
function generateToken(user: User) {
    try {
        // For now, login tokens will last for one hour
        return {token: jwt.sign({ userId: user.username }, secretKey, { expiresIn: '1h'}), error: null};

    } catch (serverError) {
        return {token: null, error: serverError };
    }
}

export { findUser, validatePassword, generateToken }