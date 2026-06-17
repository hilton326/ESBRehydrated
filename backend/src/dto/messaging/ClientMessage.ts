// Expected format for messages received from the client

export interface ClientMessage {
    sender: string;
    text: string;
    timestamp: string; // String for now, depends on what I do for database
}