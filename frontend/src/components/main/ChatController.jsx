import { useState, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from "socket.io-client";

import TitleBar from './TitleBar.jsx';
import MessageDisplay from './messaging/MessageDisplay.jsx';
import MessageInput from './messaging/MessageInput.jsx';
import ProfileDisplay from './sidebar/ProfileDisplay.jsx';
import MemberList from './sidebar/MemberList.jsx';

import thinkton from '../../assets/legothinkton.png'; // image placeholder

export default function ChatController({account, profilePicture}) {

    // Get account ID, name, and profile picture of current user
    const id = account?.id ?? 0;
    const name = account?.name ?? 'Thinkton';
    const picture = profilePicture ?? thinkton;
    
    // Permanent instance of the socket connection
    const socketRef = useRef(null);
    // Message array 
    const [messages, setMessages] = useState([]);
    // Member array (who is currently in the chat)
    const [members, setMembers] = useState([]);

    // Receiving messages: Use socket.io client to receive new messages
    useEffect(() => {
        // Establish connection with server
        socketRef.current = io({
            withCredentials: true // send cookie
        });

        // Listen for new messages from server and call updateMsgList
        socketRef.current.on("message", (newMsg) => {
            if (newMsg) {
                /* Update message display array:
                * "prev" represents previous contents of the array. We just add newMsg to it */
                //console.log(newMsg);
                setMessages(prev =>  [...prev, newMsg] );
                //console.log("message #", newMsg.id);
            }
        });

        /* Member list updates:
            * "clients:init" = Server sends entire member list when you first join 
            * "clients:add" = Signal that someone joined; server sends matching info to be added
            * "clients:remove" = Signal that someone left; server sends matching info to be removed
        */
        socketRef.current.on("clients:init", (memberList) => {
            if (memberList) {
                console.log("Member list initialized:", memberList);
                setMembers(memberList);
            }
        });
        socketRef.current.on("clients:add", (newMember) => {
            if (newMember) {
                console.log("New member:", newMember);
                setMembers(prev => [...prev, newMember] );
            }
        });
        socketRef.current.on("clients:remove", (deleteMember) => {
            if (deleteMember) {
                console.log("Member to delete:", deleteMember);
                // Filter out members that match the info returned from the server
                setMembers(prev => {
                    console.log("Members before deletion: ", prev);
                    const update = prev.filter(member => member.id !== deleteMember.id);
                    return update;
                });
            }
        });

        // Handle disconnection
        return () => {
            socketRef.current?.off("message");
            socketRef.current?.disconnect();
            socketRef.current = null;
            // Reset message and member lists
            setMessages([]);
            setMembers([]);
        };
    }, []);

    // When a new message is added, scroll to the bottom of the message list
    useEffect(() => {
        var objDiv = document.getElementById("message-list");
        objDiv.scrollTop = objDiv.scrollHeight;
    }, [messages]);

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
                    <MessageInput onNewMessage={sendNewMsg} profilePicture={picture}/>
                </div>
            </div>
            <div id="sidebar">
                <ProfileDisplay account={account}/>
                <MemberList accountID={id} memberList={members} /> 
            </div>
        </div> 
    );
}