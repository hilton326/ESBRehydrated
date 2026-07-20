import { useState, useCallback } from 'react';
import { logoutRequest } from '../../../api/client.js'; // Import the client for API calls
import { useNavigate } from "react-router-dom";
import PopupYesNo from '../../common/PopupYesNo.jsx';

function ProfileDropdown() {
    const navigate = useNavigate();
    const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);

    // Toggle visibility of the logout prompt
    const onLogoutClick = useCallback((state) => {
        setLogoutPopupVisible(state);
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
                <li className="button"> Profile Settings </li>
                <li className="button" onClick={() => onLogoutClick(true)}> Log Out </li>
            </ul>
            {logoutPopupVisible ? ( 
                <div> 
                    <PopupYesNo
                        title={"Log Out"} 
                        message={"Are you sure you want to log out of the chat?"} 
                        onYes={() => handleLogout()} 
                        onNo={() => onLogoutClick(false)} 
                    /> 
                </div> 
            ) : (
                <div> </div>
            )}
        
        </div>
    );
}

export default ProfileDropdown;