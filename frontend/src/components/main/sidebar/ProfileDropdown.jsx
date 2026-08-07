import { useState, useCallback } from 'react';
import { logoutRequest } from '../../../api/AuthClient.js'; // Import the client for API calls
import { useNavigate } from "react-router-dom";
import ProfileSettingsMenu from '../settings/ProfileSettingsMenu.jsx';
// import AccountSettingsMenu from '../settings/AccountSettingsMenu.jsx';
import PopupYesNo from '../../common/PopupYesNo.jsx';
// import thinkton from '../../../assets/legothinkton.png'; // image placeholder
import {walkGary} from '../../../api/ProfileClient.js';

function ProfileDropdown({accountInfo, onClose}) {
    
    const navigate = useNavigate();
    const [walkingGary, setWalkingGary] = useState(accountInfo?.walkingGary ?? false);
    const [profileSettingsVisible, setProfileSettingsVisible] = useState(false);
    const [accountSettingsVisible, setAccountSettingsVisible] = useState(false);
    const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);

    // MenuController: Takes in a useState function and a state to set
    // So, any of the menu states can be toggled using just this function
    const menuController = useCallback((func, state) => {
        console.log(func, state);
        func(state);
    }, []);

    const toggleWalkingGary = async() => {
        const statusUpdated = await walkGary(accountInfo.id, walkingGary);
        if (statusUpdated.ok) {
            setWalkingGary(!walkingGary);
            console.log(`result: ${statusUpdated.ok}`);
            onClose?.();
        }
    }

    // Handle logging out
    const handleLogout = useCallback(async() => {
        // Attempt to logout
        const logout = await logoutRequest();
        // If successful, redirect to login page
        if (logout.successful) {
            console.log("Logout successful. Returning to login page");
            navigate('/login');
        } else {
            alert(String(logout.error));
        }
    }, [navigate]);

    return (
        <div id="profile-dropdown">
            <ul>
                <li className="button" onClick={() => toggleWalkingGary()}> {walkingGary ? "Return to Chat" : "Walk Gary"} </li>
                <li className="button" onClick={() => menuController(setProfileSettingsVisible, true)}> Profile Settings </li>
                <li className="button" onClick={() => menuController(setAccountSettingsVisible, true)}> Account Settings </li>
                <li className="button" onClick={() => menuController(setLogoutPopupVisible, true)}> Log Out </li>
            </ul>

            {profileSettingsVisible && ( 
                <ProfileSettingsMenu
                    accountInfo={accountInfo}
                    onClose={() => menuController(setProfileSettingsVisible, false)} 
                /> 
            )}

            {/* {accountSettingsVisible && ( 
                <AccountSettingsMenu
                    accountID={account.id}
                    onClose={() => menuController(setAccountSettingsVisible, false)} 
                /> 
            )} */}

            {logoutPopupVisible && ( 
                <PopupYesNo
                    title={"Log Out"} 
                    message={"Are you sure you want to log out of the chat?"} 
                    onYes={() => handleLogout()} 
                    onNo={() => menuController(setLogoutPopupVisible, false)} 
                /> 
            )}
        
        </div>
    );
}

export default ProfileDropdown;