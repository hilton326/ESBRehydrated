import { useState, useCallback, useEffect } from 'react';

import MessageInput from './MessageInput.jsx';
import Message from './Message.jsx';

export default function MessageDisplay({account}) {
    // Use IDs for comparing accounts
    const id = account?.id ?? 0;
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

    // Record length of messages array to keep track of renders
    useEffect(() => console.log('messages length', messages.length), [messages.length]);

    return (
        <div id="message-display">
            <div id="message-list">
                {messages.map((msg) => (
                    < Message 
                        key={msg.id}
                        msgBody={msg.text}
                        msgType={msg.msgType}  
                        senderID={msg.senderID} 
                        senderName={msg.senderName}
                        senderProfile={msg.profilePicture}   
                        timestamp={msg.timestamp} 
                        currentUserID={id}
                    />
                ))}
            </div>
                < MessageInput accountID={id} accountName={name} onNewMessage={updateMsgList} />
        </div>
        
    )
}
