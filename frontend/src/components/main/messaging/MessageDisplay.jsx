//import { useState, useCallback, useEffect } from 'react';
import MessageInput from './MessageInput.jsx';
import Message from './Message.jsx';

/* MessageDisplay: Message list container.
* accountID = current user ID; never changes
* messageList = message array
* cache = accountCache; used for profile pictures */
export default function MessageDisplay({accountID, messageList, cache}) {
    
    // memberList.forEach(member => {
    //     let count = 0;
    //     messageList.forEach(msg => {
    //         if (msg.senderID === member.id) {
    //             count++;
    //         }
    //     })
    //     console.log(member.name, "has", count, "messages");
    // })

    // Retrieve each message's sender data from cache
    function getSenderData(msg) {
        if (!msg) return;
       
        let data = cache?.find(member => member.id === msg.senderID);
        if (!data) {
            data = {id: msg.senderID, name: msg.senderName, profilePicture: null};
        }
        return data;
    }

    return (
        <div id="message-list">
            {messageList.map((msg) => (
                <Message 
                    key={msg.id}
                    msgBody={msg.text}
                    msgType={msg.msgType}  
                    senderData={getSenderData(msg)}  
                    timestamp={msg.timestamp} 
                    currentUserID={accountID}
                />
            ))}
        </div>
    )
}
