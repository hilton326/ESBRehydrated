//import { useState, useCallback, useEffect } from 'react';

import MessageInput from './MessageInput.jsx';
import Message from './Message.jsx';

export default function MessageDisplay({accountID, messageList}) {

    return (
        <div id="message-list">
            {messageList.map((msg) => (
                <Message 
                    key={msg.id}
                    msgBody={msg.text}
                    msgType={msg.msgType}  
                    senderID={msg.senderID} 
                    senderName={msg.senderName}
                    senderProfile={msg.profilePicture}   
                    timestamp={msg.timestamp} 
                    currentUserID={accountID}
                />
            ))}
        </div>
    )
}
