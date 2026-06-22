import Image from './Image.jsx'
import thinkton from '../assets/legothinkton.png'; // image placeholder

/* Message component
* sender = sender of message
* me = current user
* profilePicture = profile picture of sender
* msgBody = message text
* timestamp = time message was sent by server */
const Message = ({ sender, me, profilePicture, msgBody, timestamp }) => {

    // Placeholder PFP
    const picture = profilePicture ?? thinkton;

    // Convert the timestamp into readable date and time
    const datetime = timestamp.split('T');
    const date = datetime[0];
    const time = datetime[1].slice(0,8);

    // Use different CSS to distinguish messages the current user sent and those that others send
    const myMessage = (sender == me);
    const sentMessage = 
        <div id="message-self" >
            <Image size={30} image={picture} alt={"user profile picture"} />
            <div id="msgTextContainer">
                <p id="msgSenderText"> {sender} </p>
                <p id="msgTimestamp"> {date} {time} </p>
                <p id="msgBodyText"> {msgBody} </p>
            </div>
        </div>;
    const receivedMessage =
        <div id="message" >
            <Image size={30} image={picture} alt={"user profile picture"} />
            <div id="msgTextContainer">
                <p id="msgSenderText"> {sender} </p>
                <p id="msgTimestamp"> {date} {time} </p>
                <p id="msgBodyText"> {msgBody} </p>
            </div>
        </div>;

    const content = myMessage ? sentMessage : receivedMessage;
    return content;
}

export default Message;
