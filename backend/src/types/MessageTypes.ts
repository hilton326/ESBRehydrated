import { Account } from './AccountTypes';

// Expected format for messages received from the database
export type Message = {
    id: number;
    text: string;
    sender: Account; // linked by foreign key
    prevSender?: Account; // linked by foreign key
    timestamp: string;
}

// Expected format for messages sent by the server
export type ServerMessage = {
    id: number,
    socket: string,
    msgType: number,
    senderID: number,
    senderName: string,
    text: string,
    timestamp: Date | string,
    profilePicture: string,
};

// Expected format for messages received from the client
export type ClientMessage = {
    senderID: number;
    senderName: string;
    text: string;
}