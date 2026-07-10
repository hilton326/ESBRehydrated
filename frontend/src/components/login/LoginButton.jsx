import React from 'react';
import { loginRequest } from '../../api/client.js'; // Import the client for API calls
import { useNavigate } from "react-router-dom";

const LoginButton = ({email, password}) => {
    const navigate = useNavigate();

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

    const handleLogin = async () => {
        // Check that credentials exist before contacting server
        const inputCheck = inputChecker(email, password);
        if (inputCheck.result === false) {
            alert(inputCheck.error);
            return;
        }
        // Attempt to authenticate
        const login = await loginRequest(email, password);
        // If successful, store the token and redirect to main page
        if (login.successful) {
            console.log("Storing token and proceeding to main page");
            navigate('/chat');
        }
    }

    return (
        <div>
            <button className="login-button" onClick={handleLogin}>
                Log In
            </button>
        </div>
    )
}

export default LoginButton;