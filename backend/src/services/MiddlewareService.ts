// imports
import { Request, Response, NextFunction} from 'express';
import { Account } from '../types/AccountTypes';
import { getAccountById } from '../repository/AccountRepository';

const secretKey = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

export interface JwtRequest extends Request { account?: any; }

// Middleware for token verification
export const verifyToken = async (token: string) => {
    try {
        // Throw an exception immediately if the JWT secret is not defined
        if (!secretKey) throw new Error('Missing JWT_SECRET! Are the environment variables set?');

        // Verify JWT token
        const payload = jwt.verify(token, secretKey) as { accountId: number, iat: number, exp: number };
        //if (!payload.accountId) return res.status(401).json({error:'Invalid token payload'});
        if (!payload.accountId) return {account: null, error: 'Invalid token payload'};

        // Retrieve account by ID (from database)
        const matchingAccount: Account = await getAccountById(payload.accountId);
        //if (!matchingAccount) return res.status(401).json({error:'Account not found'});
        if (!matchingAccount) return {account: null, error: 'Account not found'};

        // Return (non-sensitive) account info
        const accountInfo = {id: matchingAccount.id, email: matchingAccount.email, name: matchingAccount.name, profilePicture: undefined };
        return {account: accountInfo, error: null};

    // Handle unexpected errors
    } catch (err) {
        console.error(err);
        return {account: null, error: 'Invalid or expired token'};
    }
};