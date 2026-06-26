// MessageRepository: Handles database queries for storing messages.

import { query } from '../db';
import { QueryResult } from 'pg';

import { Message }  from '../models/Message';

// getAllMessages: Retrieves every message currently in the database.
// WARNING: If we increase the maximum message count, this query will become very slow.
export const fetchAllMessages = async () => {
    try {
        const response = await query
            ('SELECT * FROM messages' +
             'ORDER BY id ASC' +
             'LIMIT 100' );
        return response.rows[0] ?? null;
    
    } catch (error) {
        console.error('Error returning messages', error);
        throw error;
    }
};

// fetchRecentMessages: Retrieves the last 100 messages in the database.
export const fetchRecentMessages = async () => {
    try {
        const response = await query
            ('SELECT * FROM messages' +
             'ORDER BY id DESC' +
             'LIMIT 100' );
        return response.rows[0] ?? null;
    
    } catch (error) {
        console.error('Error returning messages', error);
        throw error;
    }
};

// getLastMessageID: Retrieves the most recent message and gets its ID.
export const getLastMessageID = async () => {
    try {
        const response = await query(
            `SELECT * FROM messages 
             ORDER BY id DESC
             LIMIT 1`
        );
        return response.rows[0]?.id ?? null;
    
    } catch (error) {
        console.error('Error returning last message ID', error);
        throw error;
    }
};

// newMessage: Stores a new message in the database.
export const storeNewMessage = async (text: string, senderID: number, prevSenderID: number, timestamp: string) => {
    try {
        const response = await query(
            `INSERT INTO messages (text, sender, prev_sender, timestamp)
             VALUES ($1, $2, $3, $4) RETURNING *`, 
             [text, senderID, prevSenderID, timestamp]
        );
        return response.rows[0];
    
    } catch (error) {
        console.error('Error storing message in database:', error);
        throw error;
    }
};