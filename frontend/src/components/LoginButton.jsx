import React from 'react';
import { loginRequest } from '../api/client.js'; // Import the client for API calls

const LoginButton = ({email, password}) => {

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
            const inputCheck = inputChecker(email, password);
            if (inputCheck.result === false) {
                alert(inputCheck.error);
                return;
            }

            const login = await loginRequest(email, password);
            if (login.successful) {
                console.log("Storing token and proceeding to main page");
                console.log(login.token);
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