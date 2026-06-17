import ESBLogo from '../assets/ESB.webp';
import Image from './common/Image.jsx';

function TitleBar() {
    return (
        <div id='titlebar'>
            <Image size={90} image={ESBLogo} alt={"website logo"} />
            <h2>Codename Chill v0.1</h2>
        </div>
    )
}

export default TitleBar