import { Message, ServerMessage }  from '../types/MessageTypes';
import { getLastMessageID, getLastMessageSender, storeNewMessage, getRecentMessages } from '../repository/MessageRepository';
import { getAccountById} from '../repository/AccountRepository';

// getMessageCount: Figure out what the next message ID should be (the ID of the last message plus one)
export async function getMessageCount() {
    // Retrieve total # of messages from database
    const msgCount = Number(await getLastMessageID());
    // console.log("Current message count:", msgCount);
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
            timestamp: msg.timestamp,
            type: msg.type
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
                console.log("WARNING: Couldn't retrieve previous sender information. Defaulting to 0.");
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
        // console.log(`Id: ${message.id}, Message.txt: ${message.text}`);
        // console.log(`Sender: ${message.senderID}, PrevSender: ${prevSenderID}, Msgtype: ${message.msgType}`);
        // console.log(`senderID === prevSenderID: ${(senderID === message.senderID)}`);
        // console.log();

        return message;

    } catch (error) {
        console.error(`Error preparing message: ${error}`);
        return null;
    }
};

// storeMessage: Store a new message in the database.
export async function storeMessage(msg: ServerMessage) {
    try {
        // Ensure that the sender and previous sender IDs are linked to an account
        const senderCheck = await getAccountById(msg.senderID);
        if (!senderCheck) { 
            throw new Error("Account not found with ID " + msg.senderID); 
        }
        // const prevSenderID = await getLastMessageSender();
        // if (prevSenderID == null) { 
        //     throw new Error("Error retrieving previous sender ID"); 
        // }

        // If both checks pass, attempt to store new message in the DB
        const added = await storeNewMessage(msg.text, msg.senderID, String(msg.timestamp), msg.msgType);
        if (!added) { 
            return false; 
        }
        return true;

    } catch (error) {
        console.error(`Error storing message in database: ${error}`);
        return false;
    }
};