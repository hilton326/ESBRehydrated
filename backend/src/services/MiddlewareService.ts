// imports
import { Request, Response, NextFunction} from 'express';
import { Account } from '../models/Account';
import { getAccountById } from '../repository/AccountRepository';

const secretKey = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

export interface JwtRequest extends Request { account?: any; }

// Middleware for token verification
export const verifyToken = async (req: JwtRequest, res: Response, next: NextFunction) => {
    try {
        // Make sure headers are correct
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({data: req, error:'Header is incorrect'});
        // Extract token from header
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!token) return res.status(401).json({data: req, error:'Token not received correctly'});

        // Verify JWT token
        const payload = jwt.verify(token, secretKey) as { accountId: number, iat: number, exp: number };
        if (!payload.accountId) return res.status(401).json({data: req, error:'Invalid payload'});

        // Retrieve account by ID (from database)
        const matchingAccount: Account = await getAccountById(payload.accountId);
        if (!matchingAccount) return res.status(401).json({data: req, error:'Account not found'});

        // Modify the request to include the (non-sensitive) account info
        req.account = {id: matchingAccount.id, email: matchingAccount.email, name: matchingAccount.name };
        // Pass control back to the controller that called this function
        next();

    // Handle unexpected errors
    } catch (err) {
        console.error(err);
        return res.status(403).json({data: req, error: 'Invalid or expired token'});
    }
};