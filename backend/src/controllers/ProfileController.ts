// AuthController: Handles API routes related to authentication and registration

// Express.js imports
import { Router, Request, Response } from 'express';
const router = Router();
import path from "node:path";

import { getProfilePicture } from '../services/ProfileService';
import { getTokenFromCookie, verifyToken } from '../services/MiddlewareService';

const DEFAULT_PROFILE = path.resolve(process.cwd(), "src", "uploads", "default.png");

/* profile picture test */
router.get('/picture', async (req: Request, res: Response) => {
    // Authenticate before continuing
    const tokenData = await getTokenFromCookie(req);
    if (!tokenData.token) {
        console.error(tokenData.error);
        return res.status(401);
    }
    const authData = await verifyToken(tokenData.token);
    if (!authData.account) {
        console.error(authData.error);
        return res.status(401);
    }

    // Retrieve the profile picture
    const profilePicture = getProfilePicture(authData.account.id);
    console.log(profilePicture);

    // Send it to the client
    return res.sendFile(profilePicture, { headers: { "Cache-Control": "private, max-age=3600" } }, (err) => {
        if (err) console.error("sendFile error:", err);
    });

});

export default router;