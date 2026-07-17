import { useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";

import { registrationRequest } from '../../api/client.js'; // Import the client for API calls
import Popup from '../common/Popup.jsx';

export default function RegisterButton({email, name, password, confirmPassword}) {
    const navigate = useNavigate();

    // Controls for popup that appears after attempting to register
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupData, setPopupData] = useState({isError: true, title: "", message: ""});

    // Toggle visibility of the popup
    const setPopupState = useCallback((state) => {
        setPopupVisible(state ?? !popupVisible);
    }, [popupVisible]);

    // Ensure credentials meet requirements before even contacting the server
    const inputChecker = (email, name, password, confirmPassword) => {
        // Make sure inputs aren't empty
        if (!email) {
            return {result: false, error: "E-mail address is required."}
        }
        // Make sure e-mail is valid
        if (!email.includes('@')) {
            return {result: false, error: "That's not an e-mail address."}
        }
        if (!name) {
            return {result: false, error: "Display name is required."}
        }
        if (!password || !confirmPassword) {
            return {result: false, error: "Passwords cannot be blank."}
        }

        // Compare the two password inputs (make sure they're the same)
        const result = (password === confirmPassword);
        if (!result) { 
            return {result: result, error: "Passwords do not match."} 
        }
        return {result: result, error: null}
    }

    // When register button is clicked
    const onRegisterClick = async () => { 
        // Check email and password requirements
        const inputCheck = inputChecker(email, name, password, confirmPassword);
        if (inputCheck.result === false) {
            // Show an error popup
            setPopupData({isError: true, title: "Error", message: inputCheck.error});
            setPopupState(true);
            return;
        }
        // Attempt to register account on the server
        const registration = await registrationRequest(email, name, password);
        if (registration.successful) {
            // Show a success popup
            setPopupData({isError: false, title: "Success!", message: "Your account has been registered! Now, log in to start chatting."});
            setPopupState(true);
        } else {
            // Show an error popup
            setPopupData({isError: true, title: "Error", message: registration.error});
            setPopupState(true);
        }
    }

    // Navigate to login page
    const toLoginPage = () => {
        navigate('/login');
    }

    return (
        <div>
            <button className="login-button" onClick={onRegisterClick}>
                Register
            </button>
            {popupVisible ? 
            (
                <div>
                    <Popup
                        title={popupData.title} 
                        message={popupData.message}
                        buttonText={"OK"} 
                        onConfirm={() => (popupData.isError ? setPopupState(false) : toLoginPage())} 
                        isError={popupData.isError} 
                    /> 
                </div>
            ) : (
                <div> </div>
            )}
        </div>
    )
}