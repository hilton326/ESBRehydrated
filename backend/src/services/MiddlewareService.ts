// imports
import { Request, Response, NextFunction} from 'express';
import { Account } from '../types/AccountTypes';
import { getAccountById } from '../repository/AccountRepository';

const secretKey = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

export interface JwtRequest extends Request { account?: any; }

// Throw an exception immediately if the JWT secret is not defined
if (!secretKey) throw new Error('Missing JWT_SECRET! Are the environment variables set?');

// Extract token from cookie 
export async function getTokenFromCookie(req: Request) {
    // Extract token from cookie (if present)
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
        return {token: null, error: 'Invalid or expired token'};
    }
    return {token: token, error: null};
}

// Middleware for token verification
export async function verifyToken(token: string) {
    try {
        // Verify JWT token
        const payload = jwt.verify(token, secretKey) as { accountId: number, iat: number, exp: number };
        if (!payload.accountId) return {account: null, error: 'Invalid token payload'};

        // Retrieve account by ID (from database)
        const matchingAccount: Account = await getAccountById(payload.accountId);
        if (!matchingAccount) return {account: null, error: 'Account not found'};

        // Return (non-sensitive) account info
        const accountInfo = {id: matchingAccount.id, email: matchingAccount.email, name: matchingAccount.name};
        return {account: accountInfo, error: null};

    // Handle unexpected errors
    } catch (err) {
        console.error(err);
        return {account: null, error: 'Invalid or expired token'};
    }
};