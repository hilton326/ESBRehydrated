// ChatController: Handles API routes related to main chat functions

// imports
import { Router, Request, Response, NextFunction} from 'express';
import { JwtRequest, verifyToken } from '../services/MiddlewareService';

const router = Router();

// Accessing main chat application: Requires a JWT token
router.get('/', verifyToken, (req: JwtRequest, res: Response) => {
    return res.status(200).json({account: req.account});
});

export default router;