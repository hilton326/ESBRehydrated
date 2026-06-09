import React from 'react';
import { loginRequest } from '../api/client.js'; // Import the client for API calls

const LoginButton = ({emailOrName, password}) => {

    const handleLogin = async () => {
            console.log(emailOrName, password);

            const response = await loginRequest(emailOrName, password);
            console.log('Test response:', response);
    
            if (response) {
                alert("Login successful!");
            } else {
                alert("Authentication error");
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