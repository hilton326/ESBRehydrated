'use client';
import { useState } from 'react';
import { TiArrowSortedDown } from "react-icons/ti";

import thinkton from '../assets/legothinkton.png'; // image placeholder
import Image from './common/Image.jsx';
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
                <Image size={50} 
                    image={profilePicture} alt={"user profile picture"} 
                />
                <h3>{name}</h3>
                <h2 onClick={openProfileDropdown} className="profile-dropdown-button"> 
                    <TiArrowSortedDown /> 
                </h2>
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