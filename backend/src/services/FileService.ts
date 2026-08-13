import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_PROFILE = path.resolve(process.cwd(), "src", "uploads", "default.png");

// Check if the profile picture path actually exists for a user 
async function pathExists(pathToCheck: string, fallback: string) {
    try {
        const stat = await fs.stat(pathToCheck);
        if (stat.isFile()) return pathToCheck;
  } catch (e) {
    // ignore; fall back to the default PFP
  }
  return fallback;
}

async function checkForExistingFiles(baseDir: string, fileName: string) {
    /* Profile pictures are stored in src/uploads/accountData/{accountID}/pfp.{extension}.
    * If someone doesn't have a picture, we fall back to the default picture.
    * The default picture is always located at src/uploads/default.png.
    */

    // Test all four extensions to find the correct one
    const possiblePaths = [
        path.join(baseDir, `${fileName}.png`),
        path.join(baseDir, `${fileName}.jpg`),
        path.join(baseDir, `${fileName}.jpeg`),
        path.join(baseDir, `${fileName}.webp`)
    ];

    let existingPicture = DEFAULT_PROFILE;
    let fallback = DEFAULT_PROFILE;
    for (const path of possiblePaths) {
        existingPicture = await pathExists(path, fallback);
        if (existingPicture !== fallback) return existingPicture;
    }
    return fallback;
}

// getProfilePicture: Retrieve the profile picture's path based on the account ID
export async function getProfilePicture(accountID: number) {
    const baseDir = path.resolve(process.cwd(), "src", "uploads", "accountData", String(accountID));
    const profilePicture = await checkForExistingFiles(baseDir, "pfp");
    return profilePicture;
}

// determineImageType: Determine an image's file extension based on its metadata.
export function determineImageType(mimetype: string) {
    if (!mimetype) {
        return {data: null, error: "Image metadata missing"};
    }
    if (!mimetype.startsWith("image/")) {
        return {data: null, error: "File provided is not an image"};
    }

    switch (mimetype) {
        case "image/png": 
            return {data: "png"};
        case "image/jpeg": 
            return {data: "jpeg"};
        case "image/jpg": 
            return {data: "jpg"};
        case "image/webp": 
            return {data: "webp"};
        default:
            return {data: null, error: "Unsupported image format"};
    }
}

// storeFile: Save file to appropriate user directory on disk.
export async function storeFile(file: Express.Multer.File, accountID: number, fileName: string, extension: string) {
    try {
        const targetDir = path.resolve(process.cwd(), "src", "uploads", "accountData", String(accountID));
        const targetPath = path.join(targetDir, `${fileName}.${extension}`);

        // Create the directory if it doesn't exist
        await fs.mkdir(targetDir, { recursive: true });

        // Check for existing files and delete them first
        const existingFile = await checkForExistingFiles(targetDir, fileName);
        if (existingFile !== DEFAULT_PROFILE) {
            await fs.unlink(existingFile);
        }

        // Write the uploaded bytes to the disk
        await fs.writeFile(targetPath, file.buffer);
        console.log("Saved image to ", targetPath);
        return {success: true};

    } catch (e) {
        return {success: false, error: "Error creating file on disk: " + e};
    }
}

export async function createBuffer(filePath: string) {
    try {
        return fs.readFile(filePath);
    } catch (error) {
        console.error("Error reading file from", filePath, ":", error);
        return null;
    }
}