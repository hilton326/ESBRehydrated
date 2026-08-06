'use client';
import { useState, useCallback } from 'react';
import { TiArrowSortedDown } from "react-icons/ti";

import thinkton from '../../../assets/legothinkton.png'; // image placeholder
import Image from '../../common/Image.jsx';
import ProfileDropdown from './ProfileDropdown.jsx';
import Popup from '../../common/PopupYesNo.jsx';

function ProfileDisplay({accountID, displayName, profilePicture, walkingGary}) {
    // Dropdown controller
    const [dropDownOpen, setDropDownOpen] = useState(false);

      const toggleProfileDropdown = useCallback(() => {
        setDropDownOpen(!dropDownOpen);
      }, [dropDownOpen]);


     const accountInfo = {
            id: accountID ?? 0,
            name: displayName ?? "Thinkton",
            profilePicture: profilePicture ?? thinkton,
            walkingGary: walkingGary ?? false
        }
    
    return (
        <div>
            {/* USER ICON, NAME, AND DROPDOWN BUTTON */}
            <div id='profile-display'>
                <Image size={40} image={accountInfo.profilePicture} alt={"user profile picture"} margin={10} />
                <h4>{accountInfo.name}</h4>
                <h3 onClick={toggleProfileDropdown} className="profile-dropdown-button"> 
                    <TiArrowSortedDown /> 
                </h3>
                
            </div>

            {/* ACTUAL DROPDOWN MENU */}
            <div id="profile-display">
                {dropDownOpen 
                    ? <div> <ProfileDropdown accountInfo={accountInfo} onClose={toggleProfileDropdown} /> </div>
                    : <div> </div>  
                }
            </div>
        </div>
    )
}

export default ProfileDisplay;