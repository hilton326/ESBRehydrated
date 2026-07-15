import React from 'react';
import { logoutRequest } from '../../../api/client.js'; // Import the client for API calls
import { useNavigate } from "react-router-dom";

function ProfileDropdown() {
    const navigate = useNavigate();

    const handleLogout = async () => {
            // Attempt to logout
            const logout = await logoutRequest();
            // If successful, redirect to login page
            if (logout.successful) {
                console.log("Logout successful. Returning to login page");
                navigate('/login');
            } else {
                alert(String(logout.error));
            }
        }

    return (
        <div id="profile-dropdown">
            <ul>
                <li className="button"> Profile Settings </li>
                <li className="button" onClick={handleLogout}> Log Out </li>
            </ul>
        </div>
    );
}

export default ProfileDropdown;