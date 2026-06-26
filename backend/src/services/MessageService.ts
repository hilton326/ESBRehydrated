import { ServerMessage }  from '../dto/messaging/ServerMessage';
import { Message }  from '../models/Message';
import { getLastMessageID, storeNewMessage } from '../repository/MessageRepository';
import { getAccountById } from '../repository/AccountRepository';

// Figure out what the next message ID should be
// Return the ID of the last message plus one
export const getMessageCount = async() => {
    const msgCount = await getLastMessageID();
    return msgCount ? msgCount : 0;
}

// Retrieve account associated with provided sender ID
export const checkForAccount = async(id: number) => {
    return await getAccountById(id);
}

export const newMessage = async(msg: ServerMessage) => {
    // Ensure that the account ID is linked to an account
    const senderCheck = await checkForAccount(msg.senderID);
    if (!senderCheck) { 
        console.error("Account not found with ID" + msg.senderID); 
        return false;
    }

    // If the previous sender is not null, also make sure its ID is a real account
    if (msg.prevSenderID) {
        const prevSenderCheck = await checkForAccount(msg.prevSenderID);
        if (!prevSenderCheck) { 
            console.error("Invalid ID for previous sender:" + msg.prevSenderID);
            return false;
        }
    }

    const added = await storeNewMessage(msg.text, msg.senderID, msg.prevSenderID, String(msg.timestamp));
    if (added) { 
        return true; 
    }
    return false;
}