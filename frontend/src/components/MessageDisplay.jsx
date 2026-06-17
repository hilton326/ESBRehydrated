import { io, Socket } from "socket.io-client";
import { useState, useEffect, useRef } from 'react';

function MessageDisplay({account}) {

    const [message, setMessage] = useState('');

    const name = account?.name ?? 'Thinkton';

    const socketRef = useRef(null);

    // Client socket
    useEffect(() => {
        socketRef.current = io("http://localhost:8080");
        socketRef.current.on("message", (data) => console.log("got", data));

        return () => {
            socketRef.current?.off("message");
            socketRef.current?.disconnect();
            socketRef.current = null;
        };

    }, []);

    const sendMessage = (msg) => {
        let time = Date.now();
        socketRef.current?.emit("message", { sender: name, text: msg, timestamp: time } );
        setMessage("");
    }

    return (
        <div id="message-display">
            { /* insert list of messages here */}
            <input type="text" value={message} onChange={e => setMessage(e.target.value)} />
            <button onClick={() => sendMessage(message)} >
                Send
            </button>
        </div>
    )
}

export default MessageDisplay;
