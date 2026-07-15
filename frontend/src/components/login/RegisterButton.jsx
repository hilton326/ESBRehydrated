import React from 'react';
import { registrationRequest } from '../../api/client.js'; // Import the client for API calls
import { useNavigate } from "react-router-dom";

const RegisterButton = ({email, name, password, confirmPassword}) => {
    const navigate = useNavigate();

    const inputChecker = (email, name, password, confirmPassword) => {
        // Make sure inputs aren't empty
        if (!email) {
            return {result: false, error: "E-mail address is required."}
        } else if (!name) {
            return {result: false, error: "Display name is required."}
        } else if (!password || !confirmPassword) {
            return {result: false, error: "Passwords cannot be blank."}
        }

        // Make sure e-mail is valid
        if (!email.includes('@')) {
            return {result: false, error: "That's not an e-mail address."}
        }

        // Compare the two password inputs (make sure they're the same)
        const result = (password === confirmPassword);
        if (!result) { 
            return {result: result, error: "Passwords do not match."} 
        }
        return {result: result, error: null}
    }

    const handleRegister = async () => { 
        // Check email and password requirements
        const inputCheck = inputChecker(email, name, password, confirmPassword);
        if (inputCheck.result === false) {
            alert(inputCheck.error);
            return;
        }

        const registration = await registrationRequest(email, name, password);
        if (registration.successful) {
            alert("Account created successfully! Now, log in to start chatting.")
            navigate('/login');
        } else {
            alert(String(registration.error));
        }
    }

    return (
        <div>
            <button className="login-button" onClick={handleRegister}>
                Register
            </button>
        </div>
    )
}

export default RegisterButton;