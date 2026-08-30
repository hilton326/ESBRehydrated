// AccountRepository: Handles database queries for account-related operations.
// All queries are in postgreSQL.

import { query } from '../db';
import { QueryResult } from 'pg';

// getAccountById: Looks up an account based on the database ID
export async function getAccountById (id: number) {
    try {
        const response = await query('SELECT * FROM accounts WHERE id = $1', [id]);
        // Return all of the associated account data
        return response.rows[0] ?? null;
    
    } catch (err) {
        console.error(`Error searching for account by ID "${id}": ${err}`);
        return null;
    }
}

// getAccountByEmail: Looks up an account based on the email and returns its associated data
export async function getAccountByEmail(email: string) {
    try {
        const response = await query('SELECT * FROM accounts WHERE email = $1', [email]);
        // Return all of the associated account data
        return response.rows[0] ?? null;
    
    } catch (err) {
        console.error(`Error searching for account by email "${email}": ${err}`);
        return null;
    }
}

// getAccountByName: Looks up an account based on the display name and returns its associated data
export async function getAccountByName(name: string) {
    try {
        const response = await query('SELECT * FROM accounts WHERE name = $1', [name]);
        // Return all of the associated account data
        return response.rows[0] ?? null;
    
    } catch (err) {
        console.error(`Error searching for account by name "${name}": ${err}`);
        return null;
    }
}

// checkIfAccountExists: Checks if an account is already registered under this email address
export async function checkIfAccountExists(email: string) {
    try {
        const response = await query('SELECT 1 FROM accounts WHERE email = $1', [email]);
        // If any rows contained that email, return true
        return (response.rowCount != 0); 
    
    } catch (err) {
        console.error(`Error checking for account matching ${email}: ${err}`);
        return null;
    }
}

// addNewAccount: Assuming all requirements are met, adds the new account to the database.
export async function addNewAccount(email: string, name: string, password: string) {
    try {
        const verified = true // Placeholder: will be replaced by result of true email verification
        const response = await query
            (
                `INSERT INTO accounts (verified, email, name, password)
                VALUES ($1, $2, $3, $4) 
                RETURNING *`, 
                [verified, email, name, password]
            );
        return response.rows[0];
    
    } catch (err) {
        console.error(`Error adding new account {${email}, ${name}} to database: ${err}`);
        return null;
    }
}

// updateAccountDisplayName: Changes a registered account's display name
export async function updateAccountDisplayName(accountId: number, newName: string) {
    try {
        const response = await query
            (
                `UPDATE accounts
                SET name = $1
                WHERE id = $2
                RETURNING *`, 
                [newName, accountId]
            );
        return response.rows[0];
    
    } catch (err) {
        console.error(`Error updating display name for ${accountId}: ${err}`);
        return null;
    }
}

