import {useState, useCallback} from 'react';
import {useNavigate} from "react-router-dom";

import ProfileSettingsMenu from '../settings/ProfileSettingsMenu.jsx';
// import AccountSettingsMenu from '../settings/AccountSettingsMenu.jsx';
import PopupTwoButtons from '../../common/PopupTwoButtons.jsx';
// import thinkton from '../../../assets/legothinkton.png'; // image placeholder

// for API calls
import { logoutRequest } from '../../../api/AuthClient.js';
import { walkGary } from '../../../api/ProfileClient.js';

/* ProfileDropdown: Dropdown menu on profile display.
* Can open ProfileSettingsMenu or AccountSettingsMenu, log out of current session, or toggle Walking Gary status.
*
* accountInfo: id, name, profilePicture; only here to pass into submenus
* onClose: Callback to close the menu
* width: Page width, passed in from ProfileDisplay
*/
function ProfileDropdown({accountInfo, onClose, width}) {
    const pageWidth = width ?? 0;
    const navigate = useNavigate();
    const textID = (pageWidth < 700) ? "downsized-text" : "";

    // States
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

    // toggleWalkingGary: contacts API, which will tell socket server to broadcast status change to all users
    const toggleWalkingGary = async() => {
        const statusUpdated = await walkGary(accountInfo.id, walkingGary);
        if (statusUpdated.ok) {
            setWalkingGary(!walkingGary);
            console.log(`result: ${statusUpdated.ok}`);
            onClose?.();
        }
    }

    // handleLogout: Logout function. Triggered only after user selects "yes" on "are you sure?" popup
    const handleLogout = useCallback(async() => {
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
            
                <p id={textID} className="button" onClick={() => toggleWalkingGary()}> {walkingGary ? "Return to Chat" : "Walk Gary"} </p>
                <p id={textID} className="button" onClick={() => menuController(setProfileSettingsVisible, true)}> Profile Settings </p>
                <p id={textID} className="button" onClick={() => menuController(setAccountSettingsVisible, true)}> Account Settings </p>
                <p id={textID} className="button" onClick={() => menuController(setLogoutPopupVisible, true)}> Log Out </p>
            

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
                <PopupTwoButtons
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