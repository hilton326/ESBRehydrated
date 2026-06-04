// AuthController: Handles API routes related to authentication and registration

// Express.js imports
import { Router, Request, Response } from 'express';
const router = Router();
// Model imports
import { Account } from '../models/Account';
// Services (functions that handle the logic)
import { checkIfEmailExists, hashPassword, registerAccount } from '../services/RegistrationService'
// import { authenticate, generateToken } from '../services/AuthenticationService'
// Data Transfer Objects (DTOs)
import { RegistrationForm } from '../dto/accounts/RegistrationForm';
import { LoginCredentials } from '../dto/accounts/LoginCredentials';

// Registration: Requires email address, display name, and password
router.post('/register', async (req: Request, res: Response) => {
    const formInput: RegistrationForm = req.body;

    // Make sure all three items were provided
    if (formInput == null) {
        return res.status(403).send("Please fill out all fields. Empty");
    }
    if (!formInput.name || !formInput.password || !formInput.email) {
        return res.status(403).send("Please fill out all fields. One of them is empty");
    }

    // Make sure the email isn't already registered with another account
    const emailExistsResponse = await checkIfEmailExists(formInput.email);
    if (emailExistsResponse.exists) {
        return res.status(emailExistsResponse.code).send(emailExistsResponse.error);
    }
    // Hash password for security
    const hashedPasswordResponse = await hashPassword(formInput.password);
    if (hashedPasswordResponse.error) {
        return res.status(hashedPasswordResponse.code).send(hashedPasswordResponse.error);
    }
    // Create the account in the database (using hashed password; plaintext passwords must NEVER appear in the database!)
    const newAccountResponse = await registerAccount(formInput.email, formInput.name, hashedPasswordResponse.password);
    // If the new ID is -1, something went wrong
    if (newAccountResponse.id == -1) {
        return res.status(500).send(newAccountResponse);
    }
    return res.status(201).send(newAccountResponse);
})


// // Logging In: Requires either email OR display name, password
// router.post('/login', async (req: Request, res: Response) => {
//     const credentials: LoginCredentials = req.body; 
    
//     // Make sure credentials are not empty
//     if (!credentials) {
//         return res.status(403).send("Please enter your email or display name and your password.");
//     }
//     if (!credentials.emailOrName || !credentials.password) {
//         return res.status(403).send("Please enter your email or display name and your password.");
//     }
//     // Authenticate: return error message if name/email is not found or password is incorrect
//     const accountCheckResponse = await authenticate(credentials.emailOrName, credentials.password);
//     if (!accountCheckResponse.account) {
//         return res.status(accountCheckResponse.code).send(accountCheckResponse.error);
//     }

//     const currentAccount = accountCheckResponse.account;
//     // If authentication is successful, generate a login token
//     const loginToken = await generateToken(currentAccount);
//     // Record server error if something goes wrong creating the token
//     if (loginToken.error) {
//         return res.status(500).send("Server error when creating login token: " + loginToken.error);
//     }
//     // If successful, return token back to client
//     const token = loginToken.token;
//     return res.status(200).send({ token });
// })

export default router;

