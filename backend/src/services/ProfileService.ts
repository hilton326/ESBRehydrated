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

// Retrieve the profile picture's path based on the account ID
export async function getProfilePicture(accountID: number) {
    /* Profile pictures are stored in src/uploads/accountData/{accountID}/pfp.png.
    * If someone doesn't have a picture, we fall back to the default picture.
    * The default picture is always located at src/uploads/default.png.
    */
    const profilePath = path.resolve(
        process.cwd(), "src", "uploads", "accountData", String(accountID), "pfp.png"
    );
    const fallbackPath = DEFAULT_PROFILE;

    const profilePicture = await pathExists(profilePath, fallbackPath);
    console.log(profilePicture);
    if (!profilePicture) return fallbackPath;
    return profilePicture;
}

export async function createBuffer(filePath: string) {
    try {
        return fs.readFile(filePath);
    } catch (error) {
        console.error("Error reading file from", filePath, ":", error);
        return null;
    }
}