import React from 'react';
import { registrationRequest } from '../api/client.js'; // Import the client for API calls

const RegisterButton = ({email, name, password}) => {

    const handleRegister = async () => {
        const response = await registrationRequest(email, name, password);
        console.log('Test response:', response);

        if (response) {
            alert("Account created successfully!");
        } else {
            alert("Error creating account");
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