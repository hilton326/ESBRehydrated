// Expected format for messages sent by the server

export interface ServerMessage {
    id: number,
    socket: string,
    msgType: number,
    senderID: number,
    senderName: string,
    text: string,
    timestamp: Date,
    profilePicture: string,
    prevSenderID: number,
    prevSenderName: string;
};