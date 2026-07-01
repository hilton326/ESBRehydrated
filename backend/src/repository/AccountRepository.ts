// AccountRepository: Handles database queries for account-related operations.

import { query } from '../db';
import { QueryResult } from 'pg';

// getAccountById: Looks up an account based on the database ID
export const getAccountById = async (id: number) => {
    try {
        const response = await query('SELECT * FROM accounts WHERE id = $1', [id]);
        // Return all of the associated account data
        return response.rows[0] ?? null;
    
    } catch (err) {
        console.error('Error searching for account by ID:', err);
        return null;
    }
}

// getAccountByEmail: Looks up an account based on the email and returns its associated data
export const getAccountByEmail = async (email: string) => {
    try {
        const response = await query('SELECT * FROM accounts WHERE email = $1', [email]);
        // Return all of the associated account data
        return response.rows[0] ?? null;
    
    } catch (err) {
        console.error('Error searching for account by email:', err);
        return null;
    }
}

// getAccountByName: Looks up an account based on the display name and returns its associated data
export const getAccountByName = async (name: string) => {
    try {
        const response = await query('SELECT * FROM accounts WHERE name = $1', [name]);
        // Return all of the associated account data
        return response.rows[0] ?? null;
    
    } catch (err) {
        console.error('Error searching for account by name:', err);
        return null;
    }
}

// checkIfAccountExists: Checks if an account is already registered under this email address
export const checkIfAccountExists = async (email: string) => {
    try {
        const response = await query('SELECT 1 FROM accounts WHERE email = $1', [email]);
        // If any rows contained that email, return true
        return (response.rowCount != 0); 
    
    } catch (err) {
        console.error('Error checking for account:', err);
        return null;
    }
}

// createNewAccount: Assuming all requirements are met, adds the new account to the database.
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
        return null;
    }
}


