import fs from "node:fs";
import path from "node:path";

const DEFAULT_PROFILE = path.resolve(process.cwd(), "src", "uploads", "default.png");

// Check if the profile picture path actually exists for a user 
function pathExists(path: string, fallback: string) {
    try {
        if (fs.existsSync(path) && fs.statSync(path).isFile()) return path;
  } catch (e) {
    // ignore; fall back to the default PFP
  }
  return fallback;
}

// Retrieve the profile picture's path based on the account ID
export function getProfilePicture(accountID: number) {
    /* Profile pictures are stored in src/uploads/accountData/{accountID}/pfp.png.
    * If someone doesn't have a picture, we fall back to the default picture.
    * The default picture is always located at src/uploads/default.png.
    */
    const profilePath = path.resolve(
        process.cwd(), "src", "uploads", "accountData", String(accountID), "pfp.png"
    );
    const fallbackPath = DEFAULT_PROFILE;

    const profilePicture = pathExists(profilePath, fallbackPath);
    console.log(profilePicture);
    if (!profilePicture) return DEFAULT_PROFILE;
    return profilePicture;
}