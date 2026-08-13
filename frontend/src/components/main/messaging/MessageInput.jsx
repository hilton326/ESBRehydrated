import { useState } from 'react';
import Image from '../../common/Image.jsx';
import thinkton from '../../../assets/legothinkton.png'; // image placeholder

export default function MessageInput({onNewMessage, profilePicture, walkingGary}) {

    // Message input box state
    const [newMsg, setNewMsg] = useState('');

    const picture = profilePicture ?? thinkton;

    // On ENTER press, forward message up to ChatController to send
    const handleSend = (msg) => {
        if (msg) {
            onNewMessage(msg);
            setNewMsg('');
        }   
    }

    return (
        <form id="message-input" className="chat" onSubmit={e => { e.preventDefault(); handleSend(newMsg); }}>
            <Image size={60} image={picture} alt={"user profile picture"} margin={5} />
            {walkingGary 
                ? (<div id="message-input-field" className="chat"> Walking Gary... </div>) 
                : (<input id="message-input-field" className="chat" type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} />)
            }
            
        </form>
    )
}
