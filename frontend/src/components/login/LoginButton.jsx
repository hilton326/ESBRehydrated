import { useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";

import { loginRequest } from '../../api/client.js'; // Import the client for API calls
import Popup from '../common/Popup.jsx';

const LoginButton = ({email, password}) => {
    const navigate = useNavigate();

    // Controls for error popup
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupData, setPopupData] = useState("");

    // Toggle visibility of the popup
    const setPopupState = useCallback((state) => {
        setPopupVisible(state ?? !popupVisible);
    }, [popupVisible]);

    const inputChecker = (email, password) => {
        // Make sure inputs aren't empty
        if (!email) {
            return {result: false, error: "E-mail address is required."}
        } else if (!password ) {
            return {result: false, error: "Password is required."}
        }
        // Make sure e-mail is valid
        if (!email.includes('@')) {
            return {result: false, error: "That's not an e-mail address."}
        }
        return {result: true, error: null}
    }

    // On pressing login button:
    const handleLogin = async () => {
        // Check that credentials exist before contacting server
        const inputCheck = inputChecker(email, password);
        if (inputCheck.result === false) {
            setPopupData(inputCheck.error);
            setPopupVisible(true);
            console.log(popupData);
            return;
        }
        // Attempt to authenticate
        const login = await loginRequest(email, password);
        
        // If successful, store the token and redirect to main page
        if (login.successful) {
            navigate('/chat');
        } else {
            setPopupData(String(login.error));
            setPopupVisible(true);
        }
    }

    return (
        <div>
            <button className="login-button" onClick={handleLogin}>
                Log In
            </button>
            {popupVisible ? 
            (
                <div>
                     <Popup
                        title={"Error"} 
                        message={popupData}
                        buttonText={"OK"} 
                        onConfirm={() => (setPopupState(false))} 
                        isError={true} 
                    /> 
                </div>
            ) : (
                <div> </div>
            )}
        </div>
        
    )
}

export default LoginButton;