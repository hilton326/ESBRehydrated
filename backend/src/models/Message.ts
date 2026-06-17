// Linked to message table

import { Account } from './Account';

export interface Message {
    id: number;
    sender: Account; // linked by foreign key
    text: string;
    timestamp: string; // String for now, depends on what I do for database
}