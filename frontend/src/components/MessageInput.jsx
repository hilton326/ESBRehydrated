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
            onNewMessage(data);
        });

        // Handle disconnection
        return () => {
            socketRef.current?.off("message");
            socketRef.current?.disconnect();
            socketRef.current = null;
        };

    }, [onNewMessage, name]);

    // Send new message to server
    const sendNewMsg = (msg) => {
        const msgBody = { sender: name, text: msg};
        socketRef.current?.emit("message", msgBody );
        //onNewMessage(msgBody);
        setNewMsg('');
    }

    return (
        <form id="message-input" onSubmit={e => { e.preventDefault(); sendNewMsg(newMsg); }}>
            <input id="message-input-field" type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} />
            <button id="send-button" type="submit"> Send </button>
        </form>
    )
}
