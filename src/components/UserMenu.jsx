import '../styles/main.css'
import thinkton from '../assets/legothinkton.png'
import { TiArrowSortedDown } from "react-icons/ti";
import Image from './common/Image.tsx'

function UserMenu({ username }) {

    function openUserMenu() {
        alert("User profile menu opened");
    }

    return (
        <div id='usermenu'>
            <Image size={50} image={thinkton} alt={"user profile picture"} />
            <h3>{username}</h3>
            <h2 onClick={openUserMenu} className="profile-dropdown"> 
                <TiArrowSortedDown /> </h2>
        </div>
    )
}

export default UserMenu