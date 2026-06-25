// MessageRepository: Handles database queries for storing messages.

import { query } from '../db';
import { QueryResult } from 'pg';

// newMessage: Stores a new message in the database.
export const storeNewMessage = async (text: string, senderID: number, prevSenderID: number, timestamp: string) => {
    try {
        const response = await query
            ('INSERT INTO messages (text, sender, prev_sender, timestamp)' +
             'VALUES ($1, $2, $3, $4) RETURNING * ', [text, senderID, prevSenderID, timestamp]);
        return response.rows[0];
    
    } catch (error) {
        console.error('Error storing message in database:', error);
        throw error;
    }
}