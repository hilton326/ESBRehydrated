// MessageRepository: Handles database queries for storing messages.

import { query } from '../db';
import { QueryResult } from 'pg';

import { Message }  from '../models/Message';


// getMessageById: Looks up a message based on the database ID
export const getMessageById = async (id: number) => {
    try {
        const response = await query('SELECT * FROM messages WHERE id = $1', [id]);
        return response.rows[0] ?? null;
    
    } catch (err) {
        console.error('Error searching for message by ID:', err);
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
export const fetchRecentMessages = async (messageCount: number) => {
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
        return response.rows[0]?.id ?? null;
    
    } catch (error) {
        console.error('Error returning last message ID', error);
        return null;
    }
};

// newMessage: Stores a new message in the database.
export const storeNewMessage = async (text: string, senderID: number, prevSenderID: number, timestamp: string) => {
    try {
        const response = await query
        (
            `INSERT INTO messages (text, sender, prev_sender, timestamp)
             VALUES ($1, $2, $3, $4) RETURNING *`, 
             [text, senderID, prevSenderID, timestamp]
        );
        return response.rows[0];
    
    } catch (error) {
        console.error('Error storing message in database:', error);
        return null;
    }
};