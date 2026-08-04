import {useState, useRef} from 'react';
import Image from '../../common/Image.jsx';

import {updateYourProfile} from '../../../api/ProfileClient.js';

// ProfileSettingsMenu: Small menu changing display name and profile picture.
function ProfileSettingsMenu({accountID, displayName, profilePicture, onClose}) {
    const [newName, setNewName] = useState(displayName ?? ""); // for changing display name
    const [newPicture, setNewPicture] = useState(profilePicture ?? null); // for profile picture preview
    const [selectedFile, setSelectedFile] = useState(null); // uploaded file (for changing PFP)

    const [unsavedChanges, setUnsavedChanges] = useState(false); // controls visibility of Save button

    // File selection menu
    const fileInputRef = useRef(null);
    const onPickFile = () => fileInputRef.current?.click();

    // Update the PFP preview when a file is selected
    function onFileChange(e) {
        const file = e.target.files?.[0] ?? null;
        setSelectedFile(file);
        console.log(file);
        
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setNewPicture(previewUrl);
            setUnsavedChanges(true);
            // URL.revokeObjectURL(previewUrl) when you replace/remove preview
        } else {
            console.log("file is null");
            setNewPicture(profilePicture ?? null);
        }
    };

    // Changing display name input field
    function onDisplayNameChange(e) {
        setNewName(e.target.value);
        // Only control visibility of the save button if profile picture hasn't already been changed
        if (!selectedFile) {
            const nameDiffers = (e.target.value !== displayName);
            setUnsavedChanges(nameDiffers);
        }
    }

    async function onSave() {
        let selectedName = (newName !== displayName) ? newName : null;
        const response = await updateYourProfile(selectedName, selectedFile);

        if (response.ok) {
            alert("Profile updated successfully.");
            onClose?.();
        } else {
            alert("Error updating profile:", response.error);
        }
    }

    return (
        <div className="overlay">
            <div id="profile-settings">
                <div className="window-titlebar">
                    <h2 className="settings-title"> Profile Settings </h2>
                    <h2 className="close-button" onClick={() => {onClose?.();}}> X </h2>
                </div>
                <div className="settings-container">
                    <div id="name-and-picture">
                        <div id="pfp-container">    
                            <Image size={80} image={newPicture} alt={"user profile picture"} margin={0} />
                            <h5 className="button" onClick={onPickFile}> Change Picture </h5>
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={onFileChange}
                            />
                        </div>
                        <input className="login-input" type="text" value={newName} onChange={onDisplayNameChange} />
                    </div>
                    <div className="save-button">
                        {unsavedChanges && (<h2 className="button" onClick={onSave}> Save </h2>)}
                    </div>
                </div>
            
            </div>
        </div>
    )
}

export default ProfileSettingsMenu;