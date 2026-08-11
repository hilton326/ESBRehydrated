import React from 'react';
import Image from '../../common/Image.jsx';
import thinkton from '../../../assets/legothinkton.png'; // image placeholder

/* Message component props:
* msgBody = message text
* msgType = used for deciding what CSS to use
* senderData = sender of message (their id, name and picture)
* timestamp = when message was received
* currentUserID = currently logged in user; again, used for appearance */

/* React Memo will only re-render each Message if its props get changed.
* This increases performance since the entire message list won't re-render on every sent message.
*/
const Message = React.memo(function Message({msgBody, msgType, senderData, timestamp, currentUserID}) {

    // Convert the timestamp into readable date and time
    // console.log(timestamp);
    const datetime = timestamp.split('G');
    // const date = datetime[0];
    // const time = datetime[1].slice(0,8);

    // Get sender info (use fallbacks if any values aren't present)
    const senderInfo = {
        id: senderData?.id ?? 0,
        name: senderData?.name ?? "System",
        picture: senderData?.profilePicture ?? thinkton
    }

    // Your messages and other people's messages have slightly different styling
    const isMine = (senderInfo.id == currentUserID);
    // If a message has the same sender as the previous message (msgType = 2), group them together and show less information
    const isGrouped = (msgType == 2);
    // If msgType = 0, it's a system message (usually a join/leave message)
    const isSystem = (msgType == 0);

    if (isSystem) {
        return (
            <div className="system-message">
                <div className="msg-text-container">
                    <p className="system-msg-text"> {msgBody} </p>
                </div>
            </div>
        );    
    }

    return (
		<div className={`${isMine ? "my-message" : "message"}`}> 
        {/* Note to self: AND is used as shorthand for a ternary operator here */}
			{!isGrouped && (<Image size={30} image={senderInfo.picture} alt={"user profile picture"} margin={10}/>)} 
			<div className="msg-text-container">
				{!isGrouped && (<p className="msg-sender-text"> {senderInfo.name} </p>)}
				{!isGrouped && (<p className="msg-timestamp"> {datetime[0]} </p>)}
                <p className={`${isGrouped ? "msg-body-text-grouped" : "msg-body-text"}`}> {msgBody} </p>
			</div>
        </div>
    );
});
export default Message;