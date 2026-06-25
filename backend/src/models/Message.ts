// Linked to message table

import { Account } from './Account';

export interface Message {
    id: number;
    text: string;
    sender: Account; // linked by foreign key
    prevSender: Account; // linked by foreign key
    timestamp: string;
}