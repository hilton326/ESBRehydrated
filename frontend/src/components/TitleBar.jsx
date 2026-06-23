import ESBLogo from '../assets/ESB.webp';
import Image from './Image.jsx';

function TitleBar() {
    return (
        <div id='titlebar'>
            <Image size={70} image={ESBLogo} alt={"website logo"} />
            <h3>Encyclopedia SpongeBobia</h3>
        </div>
    )
}

export default TitleBar