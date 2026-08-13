'use client';
import { useState, useCallback } from 'react';
import { TiArrowSortedDown } from "react-icons/ti";

import thinkton from '../../../assets/legothinkton.png'; // image placeholder
import Image from '../../common/Image.jsx';
import ProfileDropdown from './ProfileDropdown.jsx';

import {useWindowWidth} from '../../../hooks/useWindowSize.js';

function ProfileDisplay({accountID, displayName, profilePicture, walkingGary}) {

    const pageWidth = useWindowWidth();

    // Dropdown controller
    const [dropDownOpen, setDropDownOpen] = useState(false);

    const toggleProfileDropdown = useCallback(() => {
        setDropDownOpen(!dropDownOpen);
        console.log(pageWidth);
    }, [dropDownOpen, pageWidth]);

    const accountInfo = {
        id: accountID ?? 0,
        name: displayName ?? "Thinkton",
        profilePicture: profilePicture ?? thinkton,
        walkingGary: walkingGary ?? false
    }

    function calculateImageSize() {
        if (pageWidth < 700) return 0;
        if (pageWidth < 800) return 20;
        if (pageWidth < 900) return 30;
        return 40;
    }
    
    return (
        <div>
            {/* USER ICON, NAME, AND DROPDOWN BUTTON */}
            <div id='profile-display'>
                {(pageWidth > 700) && <Image size={calculateImageSize()} image={accountInfo.profilePicture} alt={"user profile picture"} margin={10} />}
                
                <h5 className="chat-text">{accountInfo.name}</h5>
                <h4 onClick={toggleProfileDropdown} className="profile-dropdown-button"> 
                    <TiArrowSortedDown /> 
                </h4>
                
            </div>

            {/* ACTUAL DROPDOWN MENU */}
            <div id="profile-display">
                {dropDownOpen 
                    ? <div> <ProfileDropdown accountInfo={accountInfo} onClose={toggleProfileDropdown} width={pageWidth} /> </div>
                    : <div> </div>  
                }
            </div>
        </div>
    )
}

export default ProfileDisplay;