// AccountController: Handles routes forretrieval and updating of account information

// Express.js imports
import { Router, Request, Response } from 'express';
const router = Router();
import multer from "multer";

// Multer upload function: store an uploaded file in memory first
// We write it to disk later
const upload = multer({ storage: multer.memoryStorage() });

import { getProfilePicture, determineImageType, storeFile } from '../services/FileService';
import { getTokenFromCookie, verifyToken } from '../services/MiddlewareService';
import { emitDisplayNameUpdated, emitProfilePictureUpdated } from '../services/SocketEventService';
import { getDisplayNameById, changeDisplayName } from '../services/AccountService';


/* Retrieving your profile picture */
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
    
    try {   
        // Retrieve the profile picture
        const profilePicture = await getProfilePicture(authData.account.id);
        console.log(profilePicture);

        // Send it to the client
        // Note: No cache for now
        return res.sendFile(profilePicture, { headers: { "Cache-Control": "no-store" } }, (err) => {
            if (err) {
                console.error("sendFile error:", err);
                return res.status(500);
            }
        });
    } catch (e) {
        console.error("Error retrieving profile picture: " + e);
        return res.status(500);
    }

});

/* Updating profile: Changing display name and/or profile picture */
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

    // Client should provide a form with "name" and/or "picture" fields
    const { name } = req.body;
    const file = req.file;
    if (!name && !file) { 
        return res.status(400).json({error:"Missing 'name' and/or 'picture' arguments."});
    }
    // If a new profile picture was provided:
    if (file) {
        try {
            // Validate and determine file extension
            const ext = determineImageType(file.mimetype);
            if (!ext.data) {
                return res.status(400).json({error: ext.error});
            }

            // Prepare a file path and store the image there (using the account ID)
            const uploaded = await storeFile(file, authData.account.id, "pfp", ext.data);
            if (!uploaded.success) {
                return res.status(500).json({error: "Error saving new profile picture: " + uploaded.error});
            }
            // After successful upload, have the server broadcast a signal for clients to re-fetch the new information
            await emitProfilePictureUpdated(authData.account.id, authData.account.name);
        } catch (e) {
            return res.status(500).json({error: "Error saving new profile picture: " + e});
        }
    }

     // If a new name was provided:
    if (name) {
        try {
            const updated = await changeDisplayName(authData.account.id, name);
            if (!updated.success) {
                console.error(updated.error);
                return res.status(500).json({error: "Error updating display name: " + updated.error});
            }

            // After successful upload, have the server broadcast the new name
            await emitDisplayNameUpdated(authData.account.id, authData.account.name, name);

        } catch (e) {
            console.error(e);
            return res.status(500).json({error: "Error updating display name: " + e});
        }
    }

    return res.status(200).json({ok: true});
});

/* retrieving another person's display name */
router.post('/name', async (req: Request, res: Response) => {
    // Retrieve the account ID from the request body
    const form = req.body;
    if (!form) { 
        return res.status(400).json({error:"Empty response received."}); 
    }
    if (!form.id) { 
        return res.status(400).json({error:"Please provide an account ID to retrieve details for."});
    }

    try {
        // Retrieve the display name
        const nameData = await getDisplayNameById(form.id);

        if (!nameData.name) { 
            return res.status(400).json({error: nameData.error});
        }

        return res.status(200).json({ok: true, name: nameData.name});
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: e});
    }
});

/* retrieving another person's profile picture */
router.post('/picture', async (req: Request, res: Response) => {
    // Retrieve the account ID from the request body
    const form = req.body;
    // console.log("Received body:", form);
    if (!form) { 
        return res.status(400).json({error:"Empty response received."}); 
    }
    if (!form.id) { 
        return res.status(400).json({error:"Please provide an account ID to retrieve details for."});
    }
    
    try {
        // Retrieve the profile picture
        const profilePicture = await getProfilePicture(form.id);
        console.log(profilePicture);

        // Send it to the client
        // Note: No cache for now; may change later
        return res.sendFile(profilePicture, { headers: { "Cache-Control": "no-store" } }, (err) => {
            if (err) console.error("sendFile error:", err);
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({error: e});
    }
});

export default router;