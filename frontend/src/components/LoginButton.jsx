import React from 'react';
import '../api/client.js'; // Import the client for API calls

const LoginButton = () => {
    return (
        <div>
            <button className="login-button" onClick={() => alert('Login button clicked!')}>
                Login
            </button>
        </div>
    )
}

export default LoginButton;