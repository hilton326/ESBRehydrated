
import { Message }  from '../models/Message';
import { getLastMessageID, storeNewMessage, fetchRecentMessages } from '../repository/MessageRepository';
import { getAccountById } from '../repository/AccountRepository';

// Figure out what the next message ID should be
// Return the ID of the last message plus one
export const getMessageCount = async() => {
    const msgCount = await getLastMessageID();
    return msgCount ? msgCount : 0;
}

export const getRecentMessages = async(count: number) => {

    // Convert into Message objects
    async function addMsgDetails(msg: any): Promise<Message> {
        const sender = await getAccountById(msg.sender);
        const prevSender = await getAccountById(msg.prev_sender);

        const updatedMsg: Message = {
            id: msg.id,
            text: msg.text,
            sender: sender, 
            prevSender: prevSender,
            timestamp: msg.timestamp
        }
        return updatedMsg;
    }

    // Fetch messages from database
    const recentMsgs = await fetchRecentMessages(count);
    if (!recentMsgs) {
        return null;
    }

    const messageList = await Promise.all(recentMsgs.map(addMsgDetails));
    return messageList;
}

// Retrieve account associated with provided sender ID
export const checkForAccount = async(id: number) => {
    return await getAccountById(id);
}

export const newMessage = async(msg: any, prevSenderID: number) => {
    // Ensure that the account ID is linked to an account
    const senderCheck = await checkForAccount(msg.senderID);
    if (!senderCheck) { 
        console.error("Account not found with ID" + msg.senderID); 
        return false;
    }

    // Previous sender ID safety check
    let prevSender;
    if (prevSenderID != 0) {
        // If the previous sender is not 0, also make sure its ID is a real account
        const prevSenderCheck = await checkForAccount(prevSenderID);
        if (!prevSenderCheck) { 
            console.error("Invalid ID for previous sender:" + prevSenderID);
            return false;
        }
        prevSender = prevSenderID;
    } else {
        // If it is set to 0, then we can just send the database a null value
        prevSender = null;
    }

    // console.log("Timestamp before adding to DB:", msg.timestamp);
    // console.log("Timestamp before adding to DB:", String(msg.timestamp));
    const added = await storeNewMessage(msg.text, msg.senderID, prevSender, String(msg.timestamp));
    if (added) { 
        return true; 
    }
    return false;
}