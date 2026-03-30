'use client';
import { useState } from 'react';
import { TiArrowSortedDown } from "react-icons/ti";

import '../styles/main.css';
import thinkton from '../assets/legothinkton.png'; // image placeholder
import Image from './common/Image.jsx';
import ProfileDropdown from './ProfileDropdown.jsx';
import User from '../types/User.js';


/* We need a UserSettingsMenu component
*  This component will contain a logout button and a settings tab
* To conditionally render it, we can use useState, and set a boolean when the profile dropdown gets clicked
* That logout button, for now, is going to take me to the LOGIN page.
* I will keep the login page generic for now. What I need from this page is to start connecting to my backend. 

* I also will modify this to take in a User object instead of just a username.
* The User CANNOT be null since you need to be logged in to use the site, but I'll have a fallback anyway.
*/

function ProfileDisplay(user) {
    const [dropDownOpen, setDropDownOpen] = useState(false);

    function openProfileDropdown() {
        setDropDownOpen(!dropDownOpen);
        alert(dropDownOpen);
    }

    return (
        <div>
            {/* USER ICON, NAME, AND DROPDOWN BUTTON */}
            <div id='profile-display'>
                <Image size={50} 
                    image={user.profile_picture || thinkton} alt={"user profile picture"} 
                />
                <h3>{user.username || "Guest"}</h3>
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
            this is where dropdown will appear
        </div>
    )
}

export default ProfileDisplay;