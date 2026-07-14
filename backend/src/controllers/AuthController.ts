// AuthController: Handles API routes related to authentication and registration

// Express.js imports
import { Router, Request, Response } from 'express';
const router = Router();
// Model imports
import { Account } from '../types/AccountTypes';
// Services (functions that handle the logic)
import { checkIfEmailExists, hashPassword, registerAccount } from '../services/RegistrationService'
import { authenticate, generateToken } from '../services/AuthenticationService'
import { JwtRequest, verifyToken } from '../services/MiddlewareService';
// Data Transfer Objects (DTOs)
import { RegistrationForm } from '../types/AuthTypes';
import { LoginCredentials } from '../types/AuthTypes';

// Registration: Requires email address, display name, and password
router.post('/register', async (req: Request, res: Response) => {
    try {
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
        return res.status(201).json({data: newAccountResponse});
    
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"Server error during account creation"});
    }
});

// Logging In: Requires either email OR display name, password
router.post('/login', async (req: Request, res: Response) => {
    try {
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

        // Set HTTP-only cookie using the token
        const token = loginToken.token;
        const isProduction = (process.env.NODE_ENV === 'production');
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: isProduction, // security level: true or false
            sameSite: 'lax', 
            maxAge: 60 * 60 * 1000, // 1 hour (ms) — match JWT expiry
            path: '/',
        });

        // Report success back to client
        return res.status(200).json({success: true});

    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"Server error"});
    }
});

// Logout endpoint: Clears the cookie
router.post('/logout', (req: Request, res: Response) => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('auth_token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax'
        });
        return res.status(200).json({success: true});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"Server error"});
    } 
});

/* whoAmI endpoint: Verify current login session using cookie.
* Prerequisite for accessing most routes! */
router.get('/me', async (req: JwtRequest, res: Response) => {
    // Extract token from cookie
    const cookieToken = req.cookies?.auth_token;
    let token = cookieToken ?? null;

    if (!token) {
        // Fall back to authorization header if cookie not present
        // // Make sure headers are correct
        // const authHeader = req.headers['authorization'];
        // if (!authHeader) return res.status(401).json({error:'Token is missing'});
        // // Extract token from header
        // token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        // if (!token) return res.status(401).json({error:'Token not received correctly'});

        console.log("The cookie isn't present");
        return res.status(400).json({error: 'Invalid or expired token'});
    }

    // Call middleware service to validate the JWT token 
    const authData = await verifyToken(token);
    if (!authData.account) {
        return res.status(400).json({error: authData.error});
    }

    // Return account data if authentication successful
    return res.status(200).json({account: authData.account});
});


export default router;

