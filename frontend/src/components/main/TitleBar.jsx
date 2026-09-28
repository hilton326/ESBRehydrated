import ESBLogo from '../../assets/ESB_Rehydrated_cropped.png';
import Image from '../common/Image.jsx';

// TitleBar: Website logo and title.
export default function TitleBar() {
    return (
        <div id='titlebar'>
            <Image size={70} image={ESBLogo} alt={"website logo"} />
            <h3>Encyclopedia SpongeBobia Chat</h3>
        </div>
    )
};