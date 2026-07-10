'use client';
import { useState } from 'react';
import { TiArrowSortedDown } from "react-icons/ti";

import thinkton from '../../../assets/legothinkton.png'; // image placeholder
import Image from '../../common/Image.jsx';
import ProfileDropdown from './ProfileDropdown.jsx';

function ProfileDisplay({account}) {
    // Dropdown controller
    const [dropDownOpen, setDropDownOpen] = useState(false);

    function openProfileDropdown() {
        setDropDownOpen(!dropDownOpen);
    }

    const name = account?.name ?? "Thinkton";
    const profilePicture = account?.profilePicture ?? thinkton;
    
    return (
        <div>
            {/* USER ICON, NAME, AND DROPDOWN BUTTON */}
            <div id='profile-display'>
                <Image size={40} image={profilePicture} alt={"user profile picture"} margin={10} />
                <h4>{name}</h4>
                <h3 onClick={openProfileDropdown} className="profile-dropdown-button"> 
                    <TiArrowSortedDown /> 
                </h3>
            </div>

            {/* ACTUAL DROPDOWN MENU */}
            <div>
                {dropDownOpen 
                    ? <div> <ProfileDropdown /> </div>
                    : <div> </div>  
                }
            </div>
        </div>
    )
}

export default ProfileDisplay;