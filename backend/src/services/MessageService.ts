// MessageService: Message related logic.

import { Message, ServerMessage }  from '../types/MessageTypes';
import { AccountInfo }  from '../types/AccountTypes';
import { getLastMessageID, getLastMessageSender, storeNewMessage, getRecentMessages } from '../repository/MessageRepository';
import { getAccountById} from '../repository/AccountRepository';

// getMessageCount: Figure out what the next message ID should be (the ID of the last message plus one)
export async function getMessageCount() {
    // Retrieve total # of messages from database
    const msgCount = Number(await getLastMessageID());
    // console.log("Current message count:", msgCount);
    return msgCount+1;
};

// buildRecentMsgList: Retrieve the last (COUNT) messages from the database and process them into an array that socket.io can send
export async function buildRecentMsgList(count: number) {
    try {
        // Fetch raw message data from database
        const recentMsgs = await getRecentMessages(count);
        if (!recentMsgs) throw new Error("Failed to retrieve recent messages from the database");

        // Array of properly formatted ServerMessages; successfully processed messages will be added to it
        const messageList: ServerMessage[] = [];

        // Process messages in reverse order so they display oldest to newest
        for (let i = recentMsgs.length - 1; i >= 0; i--) {
            const m = recentMsgs[i];
            // Make sure the message exists
            if (!m) {
                console.warn(`No ${i}th message found.`);
                continue;
            }
            // Skip the message if there is no sender ID 
            if (m.sender == null) {
                console.warn(`Skipping message ${m.id}. No sender.`);
                continue;
            }
            // Skip the message if the sender ID cannot be verified
            const sender = await getAccountById(m.sender);
            if (!sender) {
                console.warn(`Skipping message ${m.id}. Sender cannot be verified.`);
                continue;
            }
            // All required info is now present; prepare message for sending
            const msgFromDB = await prepareMessage(m.id, m.text, sender.id, sender.name, m.timestamp, m.type);
                if (!msgFromDB) {
                    console.warn(`Failed to prepare message ${m.id} for sending.`);
                    continue;
                } else {
                    messageList.push(msgFromDB);
                }
            }

        return messageList;

    } catch (e) {
        console.error(`MessageService, buildRecentMsgList() : Error building recent message list: ${e}`);
        return null;
    }
};

/* findMissingPictureIDs:
* Sometimes, the recent messages will have senders who left the chat before a current client arrived.
* This means that their memberList doesn't contain all of the profile pictures.
* So, here, we compare the two lists and generate a list of IDs that the client needs to retrieve pictures for manually.
* */
export function findMissingPictureIDs(msgList: ServerMessage[], clientList: AccountInfo[]) {
    try {
        // Isolate the account IDs in clientList
        let clientIDs = [];
        for (let i = 0; i < clientList.length; i++) {
            const c = clientList[i];
            if (c) clientIDs.push(c.id);
        }
        
        let missingSenderIDs: number[] = []; // keeps track of account ids we've added
        let missingSenders: any[] = []; // contains both the id and display name to send back to client

        // Search recent messages for senders not currently in clientList
        for (let i = 0; i < msgList.length; i++) {
            let m = msgList[i];
            if (!m) continue;

            if (m.senderID && m.senderName) {
                // Check in both clientList and missingSenderIDs so that we don't add any ids twice
                // Add when the id is excluded from both lists
                if (!clientIDs.includes(m.senderID) && !missingSenderIDs.includes(m.senderID)) {
                    missingSenderIDs.push(m.senderID);
                    const senderData = {id: m.senderID, name: m.senderName};
                    missingSenders.push(senderData);
                }
            }
        }
        return missingSenders;

    } catch (e) {
        console.error(`MessageService, findMissingPictureIDs(): ${e}`);
    }
}

// prepareMessage: Convert the ClientMessage into a ServerMessage (add additional details) before sending it.
export async function prepareMessage(msgID: number, msgText: string, senderID: number, senderName: string, timestamp: string, msgType: number | null) {
    try {
        // Determine message type, which is needed for the client to figure out how to display it
        const assignMsgType = (sender: number, prevSender: number ) => {
            // Type 0 = System message (primarily used for join and leave logs). No sender data is associated.
            if (sender == 0) return 0;

            // Type 1 = Message has different sender from previous, so it has full sender info
            // Type 2 = Message has same sender as previous, so it has less info
            const type = (sender != prevSender) ? 1 : 2;
            return type;
        }

        /* For new messages, the msgType hasn't been calculated yet.
        * To calculate it, retrieve previous sender ID;
        * Then use sender and prevSender IDs in assignMsgType function. */
        if (msgType == null) {
            let prevSenderID = await getLastMessageSender();
            if (prevSenderID == null) {
                console.warn("WARNING: Failed to retrieve previous sender information. Defaulting to 0.");
                prevSenderID = 0;
            }
            msgType = assignMsgType(senderID, prevSenderID);
        }
        
        const message: ServerMessage = {
            id: msgID, 
            msgType: msgType,
            senderID: senderID,
            senderName: senderName,
            text: msgText, 
            timestamp: timestamp
        };
        return message;

    } catch (error) {
        console.error(`MessageService, prepareMessage(): Error preparing message: ${error}`);
        return null;
    }
};

// storeMessage: Store a new message in the database.
export async function storeMessage(msg: ServerMessage) {
    try {
        // Ensure that the sender ID is linked to an account
        const senderCheck = await getAccountById(msg.senderID);
        if (!senderCheck) { 
            throw new Error("Account not found with ID " + msg.senderID); 
        }

        // If the check passes, attempt to store new message in the DB
        const storedMsgID = await storeNewMessage(msg.text, msg.senderID, String(msg.timestamp), msg.msgType);
        return storedMsgID;

    } catch (error) {
        console.error(`MessageService, storeMessage(): Error storing message in database: ${error}`);
        return false;
    }
};