import { useState, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from "socket.io-client";

import TitleBar from './TitleBar.jsx';
import MessageDisplay from './MessageDisplay.jsx';
import MessageInput from './MessageInput.jsx';
import ProfileDisplay from './ProfileDisplay.jsx';

export default function ChatController({account}) {

    // Get account ID, name, and profile picture of current user
    const id = account?.id ?? 0;
    const name = account?.name ?? 'Thinkton';
    
    // Message array
    const [messages, setMessages] = useState([]);
    // Permanent instance of the socket connection
    const socketRef = useRef(null);

    // Receiving messages: Use socket.io client to receive new messages
    useEffect(() => {
        // Establish connection with server
        socketRef.current = io("http://localhost:8080", {
            withCredentials: true // send cookie
        });

        // Listen for new messages from server and call updateMsgList
        socketRef.current.on("message", (newMsg) => {
            if (newMsg) {
                /* Update message display array:
                * "prev" represents previous contents of the array. We just add newMsg to it */
                setMessages(prev =>  [...prev, newMsg] );
                //console.log("message #", newMsg.id);
            }
        });

        // Listen for member list updates
        socketRef.current.on("clients:init", (memberList) => {
            if (memberList) {
                console.log("Member list initialized:", memberList);
            }
        });
        socketRef.current.on("clients:update", (memberList) => {
            if (memberList) {
                console.log("Member list updated:", memberList);
            }
        });

        // Handle disconnection
        return () => {
            socketRef.current?.off("message");
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, []);

    /* Sending messages:
    * useCallback allows new messages to be passed up from the MessageInput component.
    * Note: updateMsgList is not called until the server receives the message and then broadcasts it to the chat. */
    const sendNewMsg = useCallback(msg => {
        const newMsg = { senderID: id, senderName: name, text: msg};
        socketRef.current?.emit("message", newMsg );
    }, [id, name]);

    return (
        <div id="page" className="chat">
            <div id="main">
                <TitleBar/>
                <div id="message-display">
                    <MessageDisplay accountID={id} messageList={messages}/>
                    <MessageInput onNewMessage={sendNewMsg}/>
                </div>
            </div>
            <div id="sidebar">
                <ProfileDisplay account={account}/>
                {/* <MemberList/> */}
            </div>
        </div> 
    );
}