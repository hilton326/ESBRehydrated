import '../styles/navbar.css'
import reactLogo from '../assets/react.svg'

function MessageDisplay() {
    return (
        <div className='navbar'>
            <img src={reactLogo} className="logo" alt="ESB logo" />
            <h2>Encyclopedia SpongeBobia</h2>
        </div>
    )
}

export default MessageDisplay