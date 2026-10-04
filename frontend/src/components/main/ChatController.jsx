import { useState, useCallback, useEffect, useRef } from 'react'; // hooks
import { useNavigate } from "react-router-dom"; // for page navigation
import { io, Socket } from "socket.io-client"; // for connecting and messaging the server

// Components
import TitleBar from './TitleBar.jsx';
import MessageDisplay from './messaging/MessageDisplay.jsx';
import MessageInput from './messaging/MessageInput.jsx';
import ProfileDisplay from './sidebar/ProfileDisplay.jsx';
import MemberList from './sidebar/MemberList.jsx';
import Popup from '../common/Popup.jsx';

import { getProfilePictureForId } from '../../api/ProfileClient.js'; // For API calls

// ChatController: Main content of the application. 
// accountInfo = {id, email, name}. Should always be provided by ChatPage
export default function ChatController({accountInfo}) {

    /* ******************************* CONSTANTS + STATES ********************************** */

    const id = accountInfo?.id ?? 0; // Current user ID: should always be carried over from ChatPage
    const [displayName, setDisplayName] = useState(accountInfo?.name ?? "Thinkton"); // Current user's display name
    const [walkingGary, setWalkingGary] = useState(false); // Current user's Walking Gary status (always starts false)

    const [profilePicture, setProfilePicture] = useState(null); // Current user's profile picture
    // Fetch the picture once on page load (for components such as ProfileDisplay)
    useEffect(() => {
        if (profilePicture) return;
        (async () => {
            const newURL = await getProfilePicture(id);
            if (!newURL) return;
            setProfilePicture(newURL);
        })();
    }, [id, profilePicture]);

    const [messages, setMessages] = useState([]); // Message array
    const [members, setMembers] = useState([]); // Member array (users currently in the chat)

    // Account cache: Includes {id, name, profilePicture} of all members AND those who have currently loaded messages
    const [accountCache, setAccountCache] = useState([]);
    // const accountCacheRef = useRef([]); // reference to the cache; allows usage of the data inside effects
    // const inflightRef = useRef(new Map()); // Prevents duplicate profile picture API requests

    // // Update the reference whenever the cache changes or messages are sent
    // useEffect(() => {
    //     accountCacheRef.current = accountCache;
    // }, [accountCache, messages]);

    // Controller and message text for "you're already logged in" popup
    const [isDuplicateSession, setIsDuplicateSession] = useState(false); 
    const duplicateSessionMsg = "It looks like you're already in this chat! You're probably logged in on another browser tab or on a different device. Try switching to that session instead.";

    /* ******************************* FUNCTIONS ********************************** */

    // getProfilePicture: Retrieve an account's profile picture from the API (by their id)
    async function getProfilePicture(id) {
        // console.log("ID we're sending:", id);
        const pictureURL = await getProfilePictureForId(id);
        if (pictureURL) {
            return pictureURL.url;
        }
        return null;
    }

    // handleProfileChanges: Update both memberList and cache when profile pictures or display names change
    function handleProfileChanges(id, update) {
        // Only update information for the specified account ID
        setMembers(prev => 
            prev.map(member => (member.id === id ? { ...member, ...update } : member)));
        setAccountCache(prev => 
            prev.map(account => (account.id === id ? { ...account, ...update } : account)));
    }

    const getOuttaHere = useNavigate(); // used to navigate back to login page
    // exitChat: runs when you get the BOOT
    function exitChat() {
        getOuttaHere("/login");
    }

    /* ******************************* SOCKET.IO CLIENT ********************************** */

    const socketRef = useRef(null); // Permanent instance of the socket connection

    useEffect(() => {
        // Establish connection with server
        socketRef.current = io({
            withCredentials: true // send cookie
        });

        /* Member list updates:
            * "clients:init" = Server sends entire member list when you first join 
            * "clients:add" = Signal that someone joined; server sends matching info to be added
            * "clients:remove" = Signal that someone left; server sends matching info to be removed
        */
        socketRef.current.on("clients:init", async (memberList) => {
            try {
                if (!memberList) {
                    throw new Error(`"clients:init" broadcast from server sent no data!`);
                }

                // Retrieve profile picture for every member here
                const processedMembers = await Promise.all(
                    memberList.map(async (member) => ({
                        id: member.id,
                        name: member.name,
                        walkingGary: false,
                        profilePicture: await getProfilePicture(member.id),
                    }))
                );
                setMembers(processedMembers);
                setAccountCache(processedMembers);

            } catch (e) {
                console.error(`Error retrieving member list: ${e}`);
            }
        });
        socketRef.current.on("clients:add", async (newMember) => {
            try {
                if (!memberList) {
                    throw new Error(`"clients:add" broadcast from server sent no data!`);
                }
                const addedMember = {
                    id: newMember.id,
                    name: newMember.name,
                    walkingGary: false,
                    profilePicture: await getProfilePicture(newMember.id) 
                };

                console.log("New member:", addedMember);
                setMembers(prev => [...prev, addedMember] );
                setAccountCache(prev => [...prev, addedMember] );

            } catch (e) {
                console.error(`Error retrieving new member: ${e}`);
            }
        });
        socketRef.current.on("clients:remove", (deleteMember) => {
            try {
                if (!deleteMember) {
                    throw new Error(`"clients:remove" broadcast from server sent no data!`);
                }
            
                console.log("Member to delete from server:", deleteMember);
                // Filter out members that match the info returned from the server
                setMembers(prev => {
                    console.log("Members before deletion: ", prev);
                    const update = prev.filter(member => member.id !== deleteMember.id);
                    console.log("Members after deletion: ", update);
                    return update;
                });
            } catch (e) {
                console.error(`Error removing member: ${e}`);
            }
        });

        // On initial connection, the server will send a bunch of recent messages (the last 100 sent before our arrival) all at once.
        socketRef.current.on("recent-messages", async (messageList) => {
            try {
                if (!messageList) {
                    throw new Error(`"recent-messages" broadcast from server sent no data!`);
                }
                setMessages(messageList); // Now we receive an array and can initialize the message list all at once

            } catch (e) {
                console.error(`Error retrieving and processing recent messages: ${e}`);
            }
        });

        /* Special edge case: We join chat and some senders of the recent messages have left chat, so they do not get added to memberList or accountCache.
        * Their profile pictures and display names need to be retrieved manually.
        * The server will notify us of which account IDs this applies to, so we only need to make one request per account. */
        socketRef.current.on("missing-pfps", async (missingPictureList) => {
            try {
                if (!missingPictureList) {
                    throw new Error(`"missing-pfps" broadcast from server sent no data!`);
                }
                
                for (let i = 0; i < missingPictureList.length; i++) {
                    const sender = missingPictureList[i];
                    if (!sender) {
                        console.warn("A sender in missingPicturesList is undefined");
                        continue;
                    }

                    const picture = await getProfilePicture(sender.id);
                    // Only update accountCache since these accounts are NOT in the member list!
                    setAccountCache(prev => {
                         return [...prev, { id: sender.id, name: sender.name, profilePicture: picture }];
                    });
                }

            } catch (e) {
                console.error(`Error retrieving missing profile pictures: ${e}`);
            }
        });

        // Listen for new messages from server and update message list
        socketRef.current.on("message", async (msg) => {
            try {
                if (!msg) throw new Error(`"message" broadcast from server sent no data!`);

                // Make sure sender info was received
                const senderID = msg.senderID;
                const senderName = msg.senderName;
                if (senderID == null) {
                    throw new Error("Message has no ID");
                }
                if (!senderName) {
                    throw new Error("Message has no name");
                }

                /* Update message display array:
                * "prev" represents previous contents of the array. We just add newMsg to it */
                setMessages(prev =>  [...prev, msg]);

            } catch (e) {
                console.error(`Error receiving message: ${e}`);
            }
        });

        // // On connection, the server will send a bunch of recent messages all at once.
        // // These are processed in the same way, though profile picture data needs some special logic if the sender isn't in memberList.
        // socketRef.current.on("old-message", async (msg) => {
        //     if (!msg) return;
        //     const senderID = msg.senderID;
        //     const senderName = msg.senderName;
        //     if (senderID == null) {
        //         console.error("Message has no ID");
        //         return;
        //     }
        //     if (!senderName) {
        //         console.error("Message has no name");
        //         return;
        //     }
        //     setMessages(prev =>  [...prev, msg]);

        //     /* Profile picture logic:
        //     * Check if the sender is already in the account cache (should be true for anyone currently in member list). 
        //     * If they are, don't call the API again. If not, call the API to get the profile picture and add to cache. */

        //     // Don't add the SYSTEM user to cache! (There is no profile picture associated with it)
        //     if (senderID == 0) return;

        //     // "some" is equivalent to a for loop checking this expression on each element of the ref
        //     const alreadyCached = accountCacheRef.current.some(account => account.id === senderID);
        //     if (!alreadyCached) {
        //         // Also make sure that there is not already a request ongoing for that sender ID (using inFlightRef):
        //         // This is necessary because the messages arrive faster than accountCache can update.
        //         if (!inflightRef.current.has(senderID)) {
        //             // If this isn't a duplicate request, retrieve the picture from the server and assign it to the inFlightRef
        //             inflightRef.current.set(
        //                 senderID,
        //                 (async () => {
        //                     const picture = await getProfilePicture(senderID);
        //                     return picture;
        //                 })()
        //             );
        //         }
        //         // Get the picture from the inFlightRef, then clear the inFlightRef
        //         const picture = await inflightRef.current.get(senderID);
        //         if (!picture) {
        //             inflightRef.current.delete(senderID);
        //             return;
        //         }
        //         // Update account cache with the new picture 
        //         setAccountCache(prev => {
        //             // re-check the ID for safety
        //             if (prev.some(account => account.id === senderID)) return prev;
        //             return [...prev, { id: senderID, name: senderName, walkingGary: false, profilePicture: picture }];
        //         });
        //     }
        // });

        // Display name / profile picture updates (for any member)
        socketRef.current.on("display-name-updated", (response) => {
            try {
                if (!response) {
                    throw new Error(`"display-name-updated" broadcast from server sent no data!`);
                }
                const { id: updatedId, name: updatedName } = response;
                if (updatedId == null || updatedName == null) return;

                // Update displayName state if it's the current user's display name (the IDs match)
                if (updatedId === id) {
                    setDisplayName(updatedName);
                }
                // Update both memberList and accountCache
                handleProfileChanges(updatedId, { name: updatedName }); 

            } catch (e) {
                console.error(`Walking Gary status update error: ${e}`);
            }
        });
        socketRef.current.on("walking-gary-updated", (response) => {
            try {
                if (!response) {
                    throw new Error(`"walking-gary-updated" broadcast from server sent no data!`);
                }
                console.log(`Walking Gary update: ${response}`);
                const { id: updatedId, status: updatedStatus } = response;
                if (updatedId == null || updatedStatus == null) return;

                // Update walkingGary state if it's the current user's display name (the IDs match)
                if (updatedId === id) {
                    setWalkingGary(updatedStatus);
                }
                // Update both memberList and accountCache
                handleProfileChanges(updatedId, { walkingGary: updatedStatus }); 

            } catch (e) {
                console.error(`Walking Gary status update error: ${e}`);
            }
        });
        socketRef.current.on("profile-picture-updated", async (accountID) => {
            try {
                if (!accountID) {
                    throw new Error(`"profile-picture-updated" broadcast from server sent no data!`);
                }

                // Retrieve the new URL from the API
                const newURL = await getProfilePicture(accountID);
                if (!newURL) return;

                // Update profilePicture state if it's the current user's display name (the IDs match)
                if (accountID === id) {
                    setProfilePicture(newURL);
                }
                // Update both memberList and accountCache
                handleProfileChanges(accountID, { profilePicture: newURL }); 

            } catch (e) {
                console.error(`Profile picture update error: ${e}`);
            }
        });

        // Handle duplicate connection (when you try to log in twice under the same account)
        socketRef.current.on("duplicate", () => {
            setIsDuplicateSession(true);
        });

        // Handle disconnection
        return () => {
            socketRef.current?.off("message");
            socketRef.current?.disconnect();
            socketRef.current = null;
            // Reset message and member lists
            setMessages([]);
            setMembers([]);
            setAccountCache([]);
        };
    }, [id]);

    // When a new message is received, automatically jump to the bottom of the message list
    useEffect(() => {
        // This will not occur when Walking Gary
        if (walkingGary) return;

        var objDiv = document.getElementById("message-list");
        objDiv.scrollTop = objDiv.scrollHeight;
    }, [messages, walkingGary]);

    /* sendNewMsg: Message event handler.
    * New messages are passed up from the MessageInput component.
    * Note: updateMsgList is not called until the server receives the message and then broadcasts it to the chat. */
    const sendNewMsg = useCallback(msg => {
        const newMsg = { senderID: id, text: msg};
        socketRef.current?.emit("message", newMsg );
    }, [id]);

    return (
        <div id="page" className="chat">
            <div id="main">
                <TitleBar/>
                <div id="message-display">
                    <MessageDisplay accountID={id} messageList={messages} cache={accountCache} />
                    <MessageInput onNewMessage={sendNewMsg} profilePicture={profilePicture} walkingGary={walkingGary} />
                </div>
            </div>
            <div id="sidebar">
                <ProfileDisplay accountID={id} displayName={displayName} profilePicture={profilePicture} walkingGary={walkingGary}/>
                <MemberList accountID={id} memberList={members} /> 
            </div>

            {isDuplicateSession && (
                <Popup
                    title={"Oops!"} 
                    message={duplicateSessionMsg}
                    buttonText={"OK"}
                    onConfirm={() => exitChat()}
                    isError={true}
                /> 
            )}
        </div> 
    );
}