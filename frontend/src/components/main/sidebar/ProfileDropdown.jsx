import { useState, useCallback } from 'react';
import { logoutRequest } from '../../../api/AuthClient.js'; // Import the client for API calls
import { useNavigate } from "react-router-dom";
import ProfileSettingsMenu from '../settings/ProfileSettingsMenu.jsx';
// import AccountSettingsMenu from '../settings/AccountSettingsMenu.jsx';
import PopupYesNo from '../../common/PopupYesNo.jsx';
import thinkton from '../../../assets/legothinkton.png'; // image placeholder

function ProfileDropdown({accountID, displayName, profilePicture}) {
    const navigate = useNavigate();
    const [profileSettingsVisible, setProfileSettingsVisible] = useState(false);
    const [accountSettingsVisible, setAccountSettingsVisible] = useState(false);
    const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);

    const accountInfo = {
        id: accountID ?? 0,
        name: displayName ?? "Thinkton",
        profilePicture: profilePicture ?? thinkton
    }

    // MenuController: Takes in a useState function and a state to set
    // So, any of the menu states can be toggled using just this function
    const menuController = useCallback((func, state) => {
        console.log(func, state);
        func(state);
    }, []);

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
                <li className="button"> Walk Gary </li>
                <li className="button" onClick={() => menuController(setProfileSettingsVisible, true)}> Profile Settings </li>
                <li className="button" onClick={() => menuController(setAccountSettingsVisible, true)}> Account Settings </li>
                <li className="button" onClick={() => menuController(setLogoutPopupVisible, true)}> Log Out </li>
            </ul>

            {profileSettingsVisible && ( 
                <ProfileSettingsMenu
                    accountID={accountInfo.id}
                    displayName={accountInfo.name}
                    profilePicture={accountInfo.profilePicture}
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