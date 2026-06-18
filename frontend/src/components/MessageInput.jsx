import { io, Socket } from "socket.io-client";
import { useState, useEffect, useRef } from 'react';

export default function MessageInput({name, onNewMessage }) {

    const [newMsg, setNewMsg] = useState('');
    const socketRef = useRef(null);

    // Use socket.io client to receive new messages
    useEffect(() => {
        socketRef.current = io("http://localhost:8080");

        // Receive new messages from server and update message list
        socketRef.current.on("message", (data) => {
            console.log("Received", data);
            console.log(data.sender);
            if (data.sender != name) {
                onNewMessage(data);
            }
        });

        // Handle disconnection
        return () => {
            socketRef.current?.off("message");
            socketRef.current?.disconnect();
            socketRef.current = null;
        };

    }, [onNewMessage, name]);

    // Send new message to server and update message list
    const sendNewMsg = (msg) => {
        const msgBody = { sender: name, text: msg, timestamp: Date.now() };
        socketRef.current?.emit("message", msgBody );
        onNewMessage(msgBody);
        setNewMsg('');
    }

    return (
        <div id="message-input">
            <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} />
            <button onClick={() => sendNewMsg(newMsg)} >
                Send
            </button>
        </div>
    )
}
