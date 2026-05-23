import React from 'react';
import { test } from '../api/client.js'; // Import the client for API calls

async function handleLogin() {
    try {
        const response = await test();
        console.log('Test response:', response);
        alert(response.message); // Display the message from the API response
    } catch (error) {
        console.error('Test error:', error);
    }
}

const LoginButton = () => {
    return (
        <div>
            <button className="login-button" onClick={handleLogin}>
                Login
            </button>
        </div>
    )
}

export default LoginButton;