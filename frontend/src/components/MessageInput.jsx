import { io, Socket } from "socket.io-client";
import { useState, useEffect, useRef } from 'react';

import Image from './Image.jsx';
import thinkton from '../assets/legothinkton.png'; // image placeholder

export default function MessageInput({accountID, accountName, onNewMessage }) {

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

    }, [onNewMessage]);

    // Send new message to server
    const sendNewMsg = (msg) => {
        const msgBody = { senderID: accountID, senderName: accountName, text: msg};
        socketRef.current?.emit("message", msgBody );
        //onNewMessage(msgBody);
        setNewMsg('');
    }

    return (
        <form id="message-input" className="chat" onSubmit={e => { e.preventDefault(); sendNewMsg(newMsg); }}>
            <Image size={60} image={thinkton} alt={"user profile picture"} margin={5} />
            <input id="message-input-field" className="chat" type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} />
        </form>
    )
}
