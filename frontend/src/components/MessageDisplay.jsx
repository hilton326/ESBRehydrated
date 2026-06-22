import { useState, useCallback } from 'react';

import MessageInput from './MessageInput.jsx';
import Message from './Message.jsx';

export default function MessageDisplay({account}) {
    const name = account?.name ?? 'Thinkton';
    // Message array
    const [messages, setMessages] = useState([]);

    /* Update array to include new messages.
    *  useCallback allows the messages to be updated from the MessageInput component.
    */
    const updateMsgList = useCallback(newMsg => {
        // "prev" represents previous contents of the array- we just add newMsg to it
        console.log("New message received: ", newMsg);
        setMessages(prev =>  [...prev, newMsg] );
    }, []);

    return (
        <div id="message-display">
            <div id="message-list">
                {messages.map((msg) => (
                    <Message key={msg.id} sender={msg.sender} msgBody={msg.text} timestamp={msg.timestamp} senderProfile={msg.profilePicture} prevSender={msg.prevSender} currentUser={name}  />
                ))}
            </div>

                < MessageInput name={name} onNewMessage={updateMsgList} />
            
        </div>
        
    )
}
