import '../styles/usermenu.css'
import thinkton from '../assets/legothinkton.png'
import { TiArrowSortedDown } from "react-icons/ti";

function UserMenu({ username }) {

    function openUserMenu() {
        alert("User profile menu opened");
    }

    return (
        <div className='usermenu'>
            <div className="profile-container">
                <img src={thinkton} alt="profile picture" className="profile-image"/>
            </div>
            <h3>{username}</h3>
            <h2 onClick={openUserMenu} className="profile-dropdown"> 
                <TiArrowSortedDown /> </h2>
        </div>
    )
}

export default UserMenu