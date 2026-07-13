import React from 'react';
import Image from '../../common/Image.jsx';
import thinkton from '../../../assets/legothinkton.png'; // image placeholder

/* Message component props:
* sender = sender of message
* msgBody = message text
* timestamp = time message was sent by server
* senderProfile = profile picture of sender
* prevSender = sender of the previous message; used for deciding what CSS to use
* currentUser = currently logged in user; again, used for appearance */

/* React Memo will only re-render each Message if its props get changed.
* This increases performance since the entire message list won't re-render on every sent message.
*/
const Message = React.memo(function Message({msgBody, msgType, senderID, senderName, senderProfile, timestamp, currentUserID }) {

    // Placeholder PFP
    const picture = thinkton;
    // Convert the timestamp into readable date and time
    // console.log(timestamp);
    // const datetime = timestamp.split('T');
    // const date = datetime[0];
    // const time = datetime[1].slice(0,8);

    // Distinguish messages the current user sent and those that others send
    const thisIsMyMessage = (senderID == currentUserID);
    // If a message has the same sender as the previous message (msgType = 2), group them together
    const messageIsGrouped = (msgType == 2);

    // The component returns one of four HTML elements depending on the values of the above expressions:
    // Used when you send multiple messages in succession
    const myMessageGrouped = 
        <div className="message-self" >
            <div className="msgTextContainer">
                <p className="msgBodyTextGrouped"> {msgBody} </p>
            </div>
        </div>;
    // Used when you send a message following someone else's
    const myMessage = 
        <div className="message-self" >
            <Image size={30} image={picture} alt={"user profile picture"} margin={10} />
            <div className="msgTextContainer">
                <p className="msgSenderText"> {senderName} </p>
                <p className="msgTimestamp"> {timestamp} </p>
                <p className="msgBodyText"> {msgBody} </p>
            </div>
        </div>;
    // Used when another person sends multiple messages in succession
    const otherMessageGrouped =
        <div className="message" >
            <div className="msgTextContainer">
                <p className="msgBodyTextGrouped"> {msgBody} </p>
            </div>
        </div>;
    // Used when another person sends a message following yours or someone else's
    const otherMessage =
        <div className="message" >
            <Image size={30} image={picture} alt={"user profile picture"} margin={10} />
            <div className="msgTextContainer">
                <p className="msgSenderText"> {senderName} </p>
                <p className="msgTimestamp"> {timestamp} </p>
                <p className="msgBodyText"> {msgBody} </p>
            </div>
        </div>;
    // Used when the system sends a message (usually when someone joins or leaves)
    const systemMessage = 
        <div className="message-system" >
            <div className="msgTextContainer">
                <p className="systemMsgText"> {msgBody} </p>
            </div>
        </div>;
    
    // If msgType = 0, it's a system message
    if (msgType == 0) return systemMessage;

    // If not, return one of the others
    const messageVariants = {
        'true_true': myMessageGrouped,
        'true_false': myMessage,
        'false_true': otherMessageGrouped,
        'false_false': otherMessage,
    };
    return messageVariants[`${thisIsMyMessage}_${messageIsGrouped}`];
});

export default Message;
