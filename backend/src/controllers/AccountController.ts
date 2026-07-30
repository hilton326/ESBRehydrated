// AuthController: Handles API routes related to authentication and registration

// Express.js imports
import { Router, Request, Response } from 'express';
const router = Router();

import multer from "multer";
import path from "node:path";
import fs from "node:fs/promises";

// Multer upload function: store an uploaded file in memory first
// We write it to disk later
const upload = multer({ storage: multer.memoryStorage() });

import { getProfilePicture, determineImageType, storeFile } from '../services/FileService';
import { getTokenFromCookie, verifyToken } from '../services/MiddlewareService';
import { emitProfileUpdated } from '../services/SocketEventService';

const DEFAULT_PROFILE = path.resolve(process.cwd(), "src", "uploads", "default.png");

/* retrieving your profile picture */
router.get('/me/picture', async (req: Request, res: Response) => {
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
    const profilePicture = await getProfilePicture(authData.account.id);
    console.log(profilePicture);

    // Send it to the client
    // Note: Change cache controls
    return res.sendFile(profilePicture, { headers: { "Cache-Control": "private, max-age=3600" } }, (err) => {
        if (err) console.error("sendFile error:", err);
    });

});

/* profile picture upload */
router.post('/me/update-profile', upload.single("picture"), async (req: Request, res: Response) => {
    // Authenticate before continuing
    const tokenData = await getTokenFromCookie(req);
    if (!tokenData.token) {
        console.error(tokenData.error);
        return res.status(401).json({error: tokenData.error});
    }
    const authData = await verifyToken(tokenData.token);
    if (!authData.account) {
        console.error(authData.error);
        return res.status(401).json({error: authData.error});
    }

    // Retrieve the file from the request 
    const file = req.file;
    if (!file) {
        return res.status(400).json({error:"Missing file field 'picture'."});
    }
    // Validate and determine file extension
    const ext = determineImageType(file.mimetype);
    if (!ext.data) {
        return res.status(400).json({error: ext.error});
    }

    // Prepare a file path and store the image there (using the account ID)
    const uploaded = await storeFile(file, authData.account.id, "pfp", ext.data);
    if (!uploaded.success) {
        return res.status(500).json({error: uploaded.error});
    }
    
    // After successful upload, have the server broadcast a signal for clients to re-fetch the new information
    emitProfileUpdated(authData.account.id);
    return res.status(200).json({ok: true});
});

/* retrieving another user's profile picture */
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
    
    // Retrieve the account ID from the request body
    const form = req.body;
    if (form == null) { 
        return res.status(400).json({error:"Empty response received."}); 
    }
    if (!form.id) { 
        return res.status(400).json({error:"Please provide an account ID to retrieve details for."});
    }
    
    // Retrieve the profile picture
    const profilePicture = await getProfilePicture(form.id);
    console.log(profilePicture);

    // Send it to the client
    // Note: Change cache controls
    return res.sendFile(profilePicture, { headers: { "Cache-Control": "private, max-age=3600" } }, (err) => {
        if (err) console.error("sendFile error:", err);
    });

});

export default router;