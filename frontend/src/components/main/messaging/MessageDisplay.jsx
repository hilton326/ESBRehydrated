//import { useState, useCallback, useEffect } from 'react';
import MessageInput from './MessageInput.jsx';
import Message from './Message.jsx';

import { getProfilePicture } from '../../../api/client.js'; // For API calls

export default function MessageDisplay({accountID, messageList, memberList}) {
    
    // memberList.forEach(member => {
    //     let count = 0;
    //     messageList.forEach(msg => {
    //         if (msg.senderID === member.id) {
    //             count++;
    //         }
    //     })
    //     console.log(member.name, "has", count, "messages");
    // })

    /* Issue: Message data doesn't contain profile picture.
    We could call the API endpoint with the sender ID? */
   function getSenderData(msg) {
        if (!msg) return;
        let data = memberList?.find(member => member.id === msg.senderID);
        if (!data) {
            //const picture = await getProfilePicture(msg.senderID);
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
