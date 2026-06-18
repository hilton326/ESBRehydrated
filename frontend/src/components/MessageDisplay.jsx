import { useState, useCallback } from 'react';

import MessageInput from './MessageInput.jsx';

export default function MessageDisplay({account}) {

    // const [message, setMessage] = useState('');

    const name = account?.name ?? 'Thinkton';

    // Message array
    const [messages, setMessages] = useState([]);

    /* Update array to include new messages.
    *  useCallback allows the messages to be updated from the MessageInput component.
    */
    const updateMsgList = useCallback(newMsg => {
        // "prev" represents previous contents of the array- we just add newMsg to it
        console.log("New message received: ", newMsg);
        setMessages(prev => [...prev, newMsg]);
    }, []);

    return (
        <div id="message-display">
            <div id="message-list">
                {messages.map((msg, index) => (
                    <div key={index}>{msg.sender}: {msg.text}</div>
                ))}
            </div>

            <div id="message-input">
                < MessageInput name={name} onNewMessage={updateMsgList} />
            </div>
        </div>
        
    )
}
