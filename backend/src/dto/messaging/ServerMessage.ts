// Format of message that the server sends out to receiving clients

import { Sender } from './Sender';

export interface ServerMessage {
    sender: Sender;
    text: string;
    timestamp: string; // String for now, depends on what I do for database
}