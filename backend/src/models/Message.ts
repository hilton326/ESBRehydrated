// In the future, I will link this to the database table

import { User } from './User';

export interface Message {
    id: number;
    sender: User;
    message: string;
    timestamp: string; // String for now, depends on what I do for database
}