'use client';
import { useState, useCallback, useEffect } from 'react';
import { TiArrowSortedDown } from "react-icons/ti";

import thinkton from '../../../assets/legothinkton.png'; // image placeholder
import Image from '../../common/Image.jsx';
import ProfileDropdown from './ProfileDropdown.jsx';

function ProfileDisplay({accountID, displayName, profilePicture, walkingGary}) {

     const [pageWidth, setPageWidth] = useState(() =>
        typeof window !== 'undefined' ? document.documentElement.clientWidth : 0
    );

    useEffect(() => {
        const onResize = () => {
            setPageWidth(document.documentElement.clientWidth);
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [setPageWidth]);


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
    
    /* How can we get the dropdown to always show on mobile?
    Make it so if the screen width is below a certain amount...
    hide the profile picture to GUARANTEE the dropdown isn't squished!
    */
    
    return (
        <div>
            {/* USER ICON, NAME, AND DROPDOWN BUTTON */}
            <div id='profile-display'>
                {(pageWidth > 700) && <Image size={calculateImageSize()} image={accountInfo.profilePicture} alt={"user profile picture"} margin={10} />}
                
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