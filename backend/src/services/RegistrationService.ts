// RegistrationService: Logic for creating a new account.

import { Account } from '../models/Account';
// Database functions from Repository
import { checkIfAccountExists, createNewAccount } from '../repository/AccountRepository';

// Used to encrypt passwords
const bcrypt = require('bcryptjs');

// Make sure the provided email doesn't already exist in the database
export async function checkIfEmailExists(email: string) {
    try {
        // Check database for existing account
        const nameExists = await checkIfAccountExists(email);

        // Return true if email found
        // Also return status and error message if applicable
        const response = nameExists
            ? {exists: true, code: 400, error: "There is already an account registered under this email address. Try logging in instead."} 
            : {exists: false, code: 200, error: null};
        return response;

    } catch (serverError) {
        return {exists: null, code: 500, error: "Unexpected server error: " + serverError};
    }
}

// Encrypt password using Bcrypt
export async function hashPassword(password: string) {
    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        return {password: hashedPassword, code: 200, error: null};
    } catch (serverError) {
        return {password: null, code: 500, error: "Error encrypting the password: " + serverError};
    }
}

// Add the account to the database
export async function registerAccount(email: string, name: string, hashedPassword: string) {
    try {
        // Create account in database
        const newAccount: Account = await createNewAccount(email, name, hashedPassword)
        // Response DTO
        return {name: newAccount.name, id: newAccount.id, message: "New account created successfully!"};

    } catch (serverError) {
        // If there is an error creating an account in the database
        return {name: name, id: -1, message: "Error creating new account: " + serverError};
    }
}