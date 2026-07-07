import { useState } from 'react';

import Image from './Image.jsx';
import thinkton from '../assets/legothinkton.png'; // image placeholder

export default function MessageInput({onNewMessage}) {

    // Message input box state
    const [newMsg, setNewMsg] = useState('');

    // On ENTER press, forward message up to ChatController to send
    const handleSend = (msg) => {
        onNewMessage(msg);
        setNewMsg('');
    }

    return (
        <form id="message-input" className="chat" onSubmit={e => { e.preventDefault(); handleSend(newMsg); }}>
            <Image size={60} image={thinkton} alt={"user profile picture"} margin={5} />
            <input id="message-input-field" className="chat" type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} />
        </form>
    )
}
