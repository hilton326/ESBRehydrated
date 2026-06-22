import ESBLogo from '../assets/ESB.webp';
import Image from './Image.jsx';

function TitleBar() {
    return (
        <div id='titlebar'>
            <Image size={90} image={ESBLogo} alt={"website logo"} />
            <h2>Encyclopedia SpongeBobia</h2>
        </div>
    )
}

export default TitleBar