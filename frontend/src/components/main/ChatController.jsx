import { useState, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from "socket.io-client";

import TitleBar from './TitleBar.jsx';
import MessageDisplay from './messaging/MessageDisplay.jsx';
import MessageInput from './messaging/MessageInput.jsx';
import ProfileDisplay from './sidebar/ProfileDisplay.jsx';
import MemberList from './sidebar/MemberList.jsx';

import { getYourProfilePicture, getProfilePictureForId } from '../../api/client.js'; // For API calls

import thinkton from '../../assets/legothinkton.png'; // image placeholder

export default function ChatController({account}) {

    // Get account ID and display name of current user
    const id = account?.id ?? 0;
    const name = account?.name ?? 'Thinkton';

    const [profilePicture, setProfilePicture] = useState(thinkton); // current user's profile picture
    const [pictureUpToDate, setPictureUpToDate] = useState(false); // whether the picture is "stale"

    // Retrieves the profile picture of the current user
    useEffect(() => {
        // Retrieve profile picture
        if (!pictureUpToDate) {
            (async () => {
                const picture = await getYourProfilePicture();
                if (picture) {
                    setProfilePicture(picture.url);
                }
                setPictureUpToDate(true);
            })();
        }
    }, [pictureUpToDate]);
    
    // Permanent instance of the socket connection
    const socketRef = useRef(null);
    // Message array 
    const [messages, setMessages] = useState([]);
    // Member array (who is currently in the chat)
    const [members, setMembers] = useState([]);

    // People cache: Includes {id, name, profilePicture} of all members and those who have currently loaded messages
    const [peopleCache, setPeopleCache] = useState([]);
    const peopleCacheRef = useRef([]);

     // Update the reference whenever the cache changes
    useEffect(() => {
        peopleCacheRef.current = peopleCache;
    }, [peopleCache]);

    // Retrieve an account's profile picture from the API (by their id)
    async function getProfilePicture(id) {
        console.log("ID we're sending:", id);
        const pictureURL = await getProfilePictureForId(id);
        if (pictureURL) {
            return pictureURL.url;
        }
        return null;
    }

    // Function to update both memberList and cache when profile pictures or display names change
    function handleProfileChanges(id, update) {
        // Only update information for the specified account ID
        setMembers(prev => 
            prev.map(member => (member.id === id ? { ...member, ...update } : member)));
        setPeopleCache(prev => 
            prev.map(account => (account.id === id ? { ...account, ...update } : account)));
    }

    // const handleProfileChanges = useCallback((id, patch) => {
    //     setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));
    //     setPeopleCache(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
    // }, []);

    // Receiving messages: Use socket.io client to receive new messages
    useEffect(() => {
        // Establish connection with server
        socketRef.current = io({
            withCredentials: true // send cookie
        });

        // Listen for new messages from server and call updateMsgList
        socketRef.current.on("message", async (newMsg) => {
            if (!newMsg) return;

            const senderID = newMsg.senderID;
            const senderName = newMsg.senderName;
            if (senderID == null) {
                console.error("Message has no ID");
                return;
            }
            if (!senderName) {
                console.error("Message has no name");
                return;
            }

            /* Update message display array:
            * "prev" represents previous contents of the array. We just add newMsg to it */
            setMessages(prev =>  [...prev, newMsg] );

            // Don't add SYSTEM to cache
            if (senderID == 0) return;
            // Check if the sender is already present in cache
            for (const account of peopleCacheRef.current) {
                if (account.id === senderID) {
                    console.log(`${id} already present`);
                    return;
                }
            }

            // If not, add sender info to cache:
            const picture = await getProfilePicture(senderID);
            if (!picture) return;

            setPeopleCache(prev => {
                // re-check with functional update for safety
                if (prev.some(account => account.id === senderID)) return prev;
                return [...prev, { id: senderID, name: senderName, profilePicture: picture }];
            });

        });

        /* Member list updates:
            * "clients:init" = Server sends entire member list when you first join 
            * "clients:add" = Signal that someone joined; server sends matching info to be added
            * "clients:remove" = Signal that someone left; server sends matching info to be removed
        */
        socketRef.current.on("clients:init", async (memberList) => {
            if (!memberList) return;
            const processedMembers = await Promise.all(
                memberList.map(async (member) => ({
                    id: member.id,
                    name: member.name,
                    profilePicture: await getProfilePicture(member.id),
                }))
            );
            setMembers(processedMembers);
            setPeopleCache(processedMembers);
        });

        socketRef.current.on("clients:add", async (newMember) => {
            if (!newMember) return;
            const addedMember = {
                id: newMember.id,
                name: newMember.name,
                profilePicture: await getProfilePicture(newMember.id) // Convert raw data into image URL
            };

            console.log("New member:", addedMember);
            setMembers(prev => [...prev, addedMember] );
            setPeopleCache(prev => [...prev, addedMember] );
        });
        
        socketRef.current.on("clients:remove", (deleteMember) => {
            if (deleteMember) {
                console.log("Member to delete from server:", deleteMember);
                // Filter out members that match the info returned from the server
                setMembers(prev => {
                    console.log("Members before deletion: ", prev);
                    const update = prev.filter(member => member.id !== deleteMember.id);
                    console.log("Members after deletion: ", update);
                    return update;
                });
            }
        });

        socketRef.current.on("display-name-updated", (response) => {
            if (response) return;

            const { id: updatedId, name: updatedName } = response;
            if (updatedId == null || updatedName == null) return;

            // Update both memberList and peopleCache
            handleProfileChanges(updatedId, { name: updatedName });
        });
        socketRef.current.on("profile-picture-updated", async (accountID) => {
            if (!accountID) return;
            console.log(accountID, account.id);

            // If it's your profile picture (the IDs match), signal to update ProfileDisplay and MessageInput
            if (accountID === account.id) {
                setPictureUpToDate(false);
            }

            // Retrieve the new URL from the API
            const newURL = await getProfilePicture(accountID);
            if (!newURL) return;

            // Update both memberList and peopleCache
            handleProfileChanges(accountID, { profilePicture: newURL });
        });

        // Handle disconnection
        return () => {
            socketRef.current?.off("message");
            socketRef.current?.disconnect();
            socketRef.current = null;
            // Reset message and member lists
            setMessages([]);
            setMembers([]);
            setPeopleCache([]);
        };
    }, [account?.id]);

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
                    <MessageDisplay accountID={id} messageList={messages} cache={peopleCache} />
                    <MessageInput onNewMessage={sendNewMsg} profilePicture={profilePicture}/>
                </div>
            </div>
            <div id="sidebar">
                <ProfileDisplay account={account} profilePicture={profilePicture}/>
                <MemberList accountID={id} memberList={members} /> 
            </div>
        </div> 
    );
}