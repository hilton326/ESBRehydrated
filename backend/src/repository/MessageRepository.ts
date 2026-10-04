// MessageRepository: Handles database queries for storing messages.
// All queries are in postgreSQL.

import { query } from '../db';
import { QueryResult } from 'pg';
import { Message }  from '../types/MessageTypes';

// getMessageById: Looks up a message based on the database ID
export const getMessageById = async (id: number) => {
    try {
        const response = await query('SELECT * FROM messages WHERE id = $1', [id]);
        return response.rows[0] ?? null;
    
    } catch (err) {
        console.error(`Error searching for message by ID "${id}": ${err}`);
        return null;
    }
}

// fetchAllMessages: Retrieves every message currently in the database (from newest to oldest).
// WARNING: This is only included for testing and can be very slow. Do not use unless maximum messages is limited.
export const fetchAllMessages = async () => {
    try {
        const response = await query
        (
            `SELECT * FROM messages
             ORDER BY id DESC`
        );
        return response.rows[0] ?? null;
    
    } catch (error) {
        console.error('Error returning all messages', error);
        return null;
    }
};

// fetchRecentMessages: Retrieves the last (messageCount) messages in the database.
export const getRecentMessages = async (messageCount: number) => {
    try {
        const response = await query
        (
            `SELECT * FROM messages
            ORDER BY id DESC
            LIMIT $1`,
            [messageCount] 
        );
        
        return response.rows ?? null;
    
    } catch (error) {
        console.error('Error returning last', messageCount, 'messages', error);
        return null;
    }
};

// getLastMessageID: Retrieves the most recent message and gets its ID.
export const getLastMessageID = async () => {
    try {
        const response = await query
        (   `SELECT * FROM messages 
             ORDER BY id DESC
             LIMIT 1`
        );
        return response.rows[0]?.id ?? 0;
    
    } catch (error) {
        console.error('Error returning last message ID', error);
        return 0;
    }
};

// getLastMessageID: Retrieves the most recent message and gets its ID.
export const getLastMessageSender = async () => {
    try {
        const response = await query
        (   `SELECT * FROM messages 
             ORDER BY id DESC
             LIMIT 1`
        );
        // console.log("Message from DB: ", response.rows[0]);
        // console.log("Sender of message: ", response.rows[0].sender);
        return response.rows[0]?.sender ?? null;
    
    } catch (error) {
        console.error('Error returning last message sender', error);
        return null;
    }
};

// storeNewMessage: Stores a new message in the database and returns the new message ID if successful.
export const storeNewMessage = async (text: string, senderID: number, timestamp: string, msgType: number) => {
    try {
        const response = await query
        (
            `INSERT INTO messages (text, sender, timestamp, type)
             VALUES ($1, $2, $3, $4) RETURNING *`, 
             [text, senderID, timestamp, msgType]
        );
        return response.rows[0].id;
    
    } catch (error) {
        console.error(`MessageRepository: Error storing new message "${text}" from account ${senderID} in database: ${error}`);
        return null;
    }
};