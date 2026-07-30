import type { Server } from "socket.io";
let io: Server | null = null; 

// initialize server reference
export function initSocket(ioServer: Server) {
    io = ioServer;
}

export function emitProfileUpdated(accountID: number) {
    if (!io) return;
    const payload = { accountID };
    io.emit("profile-updated", payload);
}