import { Message, ServerMessage }  from '../types/MessageTypes';
import { getLastMessageID, storeNewMessage, getRecentMessages } from '../repository/MessageRepository';
import { getAccountById } from '../repository/AccountRepository';

// getMessageCount: Figure out what the next message ID should be (the ID of the last message plus one)
export async function getMessageCount() {
    // Retrieve total # of messages from database
    const msgCount = Number(await getLastMessageID());
    if (!msgCount) {
        console.log("Couldn't receive message count from database. Resetting msgCounter to 1");
        return 1;
    }
    console.log(msgCount, msgCount+1);
    return msgCount+1;
};

// buildRecentMsgList: Retrieve the last (COUNT) messages from the database and store them into a readable array
export async function buildRecentMsgList(count: number) {

    async function addMsgDetails(msg: any): Promise<Message> {
        // Retrieve full account details of each message
        const sender = await getAccountById(msg.sender);
        const prevSender = await getAccountById(msg.prev_sender);
        // Convert into Message objects
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
    const recentMsgs = await getRecentMessages(count);
    if (!recentMsgs) {
        return null;
    }
    const messageList = await Promise.all(recentMsgs.map(addMsgDetails));
    return messageList;
};

// prepareMessage: Convert the ClientMessage into a ServerMessage (add additional details) before sending it.
export function prepareMessage(msgID: number, msgText: string, socketID: string, senderID: number, senderName: string, senderPFP: string, prevSenderID: number, timestamp: string) {

    // Determine message type, which is needed for the client to figure out how to display it
    const assignMsgType = (sender: number, prevSender: number ) => {
        // Type 0 = System message (primarily used for join and leave logs). No sender data is associated.
        if (sender == 0) return 0;

        // Type 1 = Message has different sender from previous, so it has full sender info
        // Type 2 = Message has same sender as previous, so it has less info
        const msgType = (sender != prevSender) ? 1 : 2;
        return msgType;
    }

    const message: ServerMessage = {
        id: msgID, 
        socket: socketID,
        msgType: assignMsgType(senderID, prevSenderID),  
        senderID: senderID,
        senderName: senderName,
        text: msgText, 
        timestamp: timestamp, 
        profilePicture: senderPFP,
    };
    //console.log(message);
    return message;
};

// storeMessage: Store a new message in the database.
export async function storeMessage(msg: ServerMessage, prevSenderID: number) {
    // Ensure that the sender and previous sender IDs are linked to an account
    const senderCheck = await getAccountById(msg.senderID);
    if (!senderCheck) { 
        console.error("Account not found with ID" + msg.senderID); 
        return false;
    }
    const prevSenderCheck = await getAccountById(prevSenderID);
    if (!prevSenderCheck) { 
        console.error("Invalid ID for previous sender:" + prevSenderID);
        return false;
    }
    // If both checks pass, attempt to store new message in the DB
    const added = await storeNewMessage(msg.text, msg.senderID, prevSenderID, String(msg.timestamp));
    if (!added) { 
        return false; 
    }
    return true;
};