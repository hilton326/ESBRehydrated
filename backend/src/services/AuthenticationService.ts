// AuthenticationService: Checks login credentials.

import { Account } from '../types/AccountTypes';
import { getAccountByEmail, getAccountByName  } from '../repository/AccountRepository';

// Get this from env variables
const secretKey = process.env.JWT_SECRET;

// Used to encrypt passwords
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Main authentication function
export async function authenticate(email: string, password: string) {
    try {
        let matchingAccount: Account;
        // Look up account in the database based on provided identifier (email)
        console.log(`Searching for email address ${email}...`);
        matchingAccount = await getAccountByEmail(email);
        if (!matchingAccount) {
            return {account: null, authenticated: false, code: 403, error: "No account is associated with that email."};
        }
        
        console.log("Account found. Attempting to authenticate...");
        // If account exists, check if the entered password matches the one from the database
        const valid = await bcrypt.compare(password, matchingAccount.password);
        // Return account, authentication status, HTTP status code, and error message
        const response = valid
            ? {account: matchingAccount, authenticated: true, code: 200, error: null} 
            : {account: matchingAccount, authenticated: false, code: 403, error: "Incorrect password."};
        return response;

    } catch (serverError) {
        return {account: null, authenticated: false, code: 500, error: serverError};
    }
}

// Function to generate a session token (once credentials have been validated) 
export function generateToken(account: Account) {
    try {
        // Throw an exception immediately if the JWT secret is not defined
        if (!secretKey) throw new Error('Missing JWT_SECRET! Are the environment variables set?');

        // For now, login tokens will last for one hour
        return {token: jwt.sign({ accountId: account.id }, secretKey, { expiresIn: '1h'}), error: null};

    } catch (serverError) {
        return {token: null, error: serverError };
    }
}
