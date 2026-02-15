import '../styles/titlebar.css'
import ESBLogo from '../assets/ESB.png'

function TitleBar() {
    return (
        <div className='titlebar'>
            <div className="logo-container">
                <img src={ESBLogo} className="esb-logo" alt="ESB logo" />
            </div>
            <h2>Encyclopedia SpongeBobia</h2>
        </div>
    )
}

export default TitleBar