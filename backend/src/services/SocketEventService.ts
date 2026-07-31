import type { Server } from "socket.io";
let io: Server | null = null; 

import {getMessageCount, storeMessage} from '../services/MessageService';

// initialize server reference
export function initSocket(ioServer: Server) {
    io = ioServer;
}

export async function emitDisplayNameUpdated(accountID: number, oldName: string, newName: string) {
    if (!io) return;
    io.emit("display-name-updated", {id: accountID, name: newName});

    const msgId = await getMessageCount();
    const msgText = `${oldName} changed their name to ${newName}.`;
    const message = {id: msgId, msgType: 0, senderID: 0, senderName: "System", text: msgText, timestamp: String(new Date())};
    io.emit("message", message);

    // Add message to database
    const messageStored = await storeMessage(message);
    if (!messageStored) {
        console.log("Failed to store message #", msgId, "in the database.");
    }
}

export async function emitProfilePictureUpdated(accountID: number, displayName: string) {
    if (!io) return;
    io.emit("profile-picture-updated", accountID);

    const msgId = await getMessageCount();
    const msgText = `${displayName} changed their profile picture.`;
    const message = {id: msgId, msgType: 0, senderID: 0, senderName: "System", text: msgText, timestamp: String(new Date())};
    io.emit("message", message);

    // Add message to database
    const messageStored = await storeMessage(message);
    if (!messageStored) {
        console.log("Failed to store message #", msgId, "in the database.");
    }
}