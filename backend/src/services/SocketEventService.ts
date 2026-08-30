// SocketEventService: A bridge between the socket.io server and the API controllers.

import type { Server } from "socket.io";
let io: Server | null = null; 
// initialize server reference
export function initSocket(ioServer: Server) {
    io = ioServer;
}

import {getMessageCount, storeMessage} from '../services/MessageService';

// emitDisplayNameUpdated: Alert clients of a display name change
export async function emitDisplayNameUpdated(accountID: number, oldName: string, newName: string) {
    try {
        if (!io) throw new Error("No socket");
        io.emit("display-name-updated", {id: accountID, name: newName});

        const msgId = await getMessageCount();
        const msgText = `~ ${oldName} changed their name to ${newName}. ~`;
        const message = {id: msgId, msgType: 0, senderID: 0, senderName: "System", text: msgText, timestamp: String(new Date())};
        io.emit("message", message);

        // Add message to database
        const messageStored = await storeMessage(message);
        if (!messageStored) {
            console.warn("Failed to store message #", msgId, "in the database.");
        }
    } catch (e) {
        console.error(`${e}`);
        return false;
    }
}

// emitProfilePictureUpdated: Alert clients of a profile picture change
export async function emitProfilePictureUpdated(accountID: number, displayName: string) {
    try {
        if (!io) throw new Error("No socket");
        io.emit("profile-picture-updated", accountID);

        const msgId = await getMessageCount();
        const msgText = `~ ${displayName} changed their profile picture. ~`;
        const message = {id: msgId, msgType: 0, senderID: 0, senderName: "System", text: msgText, timestamp: String(new Date())};
        io.emit("message", message);

        // Add message to database
        const messageStored = await storeMessage(message);
        if (!messageStored) {
            console.warn("Failed to store message #", msgId, "in the database.");
        }
    } catch (e) {
        console.error(`${e}`);
        return false;
    }
}

// emitWalkingGaryUpdated: Alert clients of a "Walking Gary" status change
export function emitWalkingGaryUpdated(accountID: number, currentStatus: boolean) {
    try {
        if (!io) throw new Error("No socket");
        const newStatus = !currentStatus;
        io.emit("walking-gary-updated", {id: accountID, status: newStatus});
        return true;
    } catch (e) {
        console.error(`${e}`);
        return false;
    }
}