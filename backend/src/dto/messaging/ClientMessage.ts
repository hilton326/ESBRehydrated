// Expected format for messages received from the client

export interface ClientMessage {
    senderID: number;
    senderName: string;
    text: string;
}