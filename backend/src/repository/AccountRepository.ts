// AccountRepository: Handles database queries for account-related operations.

import { query } from '../db';
import { QueryResult } from 'pg';

// ************ HELPER QUERIES ***************
// Queries for smaller data operations that are often called by the more important ones.


// ************ SPECIFIC QUERIES ***************
// These functions directly correspond to specific functionalities, like adding a new account.
// Directly called by the Service files.

// checkIfAccountExists: Checks if an account is already registered under this email address
export const checkIfAccountExists = async (email: string) => {
    try {
        const response = await query('SELECT 1 FROM accounts WHERE email = $1', [email]);

        // If any rows contained that email, return true
        return (response.rowCount != 0); 
    
    } catch (err) {
        console.error('Error searching for name:', err);
        throw err;
    }
}

// Add new account: Assuming all requirements are met, adds the new account to the database.
export const createNewAccount = async (email: string, name: string, password: string) => {
    try {
        // Placeholder: will be replaced by result of true email verification
        const verified = true 

        const response = await query
            ('INSERT INTO accounts (verified, email, name, password)' +
             'VALUES ($1, $2, $3, $4) RETURNING * ', [verified, email, name, password]);
        
        return response.rows[0];
    
    } catch (err) {
        console.error('Error creating account in database:', err);
        throw err;
    }
}


