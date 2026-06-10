// AuthController: Handles API routes related to authentication and registration

// Express.js imports
import { Router, Request, Response } from 'express';
const router = Router();
// Model imports
import { Account } from '../models/Account';
// Services (functions that handle the logic)
import { checkIfEmailExists, hashPassword, registerAccount } from '../services/RegistrationService'
import { authenticate, generateToken } from '../services/AuthenticationService'
// Data Transfer Objects (DTOs)
import { RegistrationForm } from '../dto/accounts/RegistrationForm';
import { LoginCredentials } from '../dto/accounts/LoginCredentials';

// Registration: Requires email address, display name, and password
router.post('/register', async (req: Request, res: Response) => {
    const formInput: RegistrationForm = req.body;

    // Make sure all three items were provided
    if (formInput == null) { return res.status(400).json({error:"Empty response received."}); }
    if (!formInput.email) { return res.status(400).json({error:"E-mail address is required."}); }
    if (!formInput.name) { return res.status(400).json({error:"Display name is required."}); }
    if (!formInput.password) { return res.status(400).json({error:"Password is required."}); }

    // Make sure the email isn't already registered with another account
    const emailExistsResponse = await checkIfEmailExists(formInput.email);
    if (emailExistsResponse.exists) {
        return res.status(emailExistsResponse.code).json({error: emailExistsResponse.error});
    }
    // Hash password for security
    const hashedPasswordResponse = await hashPassword(formInput.password);
    if (hashedPasswordResponse.error) {
        return res.status(hashedPasswordResponse.code).json({error: hashedPasswordResponse.error});
    }
    // Create the account in the database (using hashed password; plaintext passwords must NEVER appear in the database!)
    const newAccountResponse = await registerAccount(formInput.email, formInput.name, hashedPasswordResponse.password);
    // If the new ID is -1, something went wrong
    if (newAccountResponse.id == -1) {
        return res.status(500).json({error:"Server error during account creation"});
    }
    return res.status(201).send(newAccountResponse);
})


// Logging In: Requires either email OR display name, password
router.post('/login', async (req: Request, res: Response) => {
    const credentials: LoginCredentials = req.body; 

    // Make sure credentials are not empty
    if (credentials == null) { return res.status(400).json({error:"Empty response received."}); }
    if (!credentials.identifier) { return res.status(400).json({error:"E-mail address or display name is required."}); }
    if (!credentials.password) { return res.status(400).json({error:"Password is required."}); }
    if (!credentials.isEmail == null) { return res.status(400).json({error: "isEmail flag not set."}); }
    console.log("Credentials received");
    
    // Authenticate: return error message if name/email is not found or password is incorrect
    const authenticationResponse = await authenticate(credentials.identifier, credentials.password, credentials.isEmail);
    if (!authenticationResponse.authenticated || !authenticationResponse.account) {
        console.error("Authentication error: " + authenticationResponse.error);
        return res.status(authenticationResponse.code).json({error: authenticationResponse.error});
    }

    const currentAccount = authenticationResponse.account;
    // If authentication is successful, generate a login token
    const loginToken = generateToken(currentAccount);
    // Record server error if something goes wrong creating the token
    if (loginToken.error) {
        console.error("Server error when creating login token: " + loginToken.error);
        return res.status(500).json({error: "Server error when creating login token"});
    }
    // If successful, return token back to client
    const token = loginToken.token;
    return res.status(200).json({token: token});
})

export default router;

