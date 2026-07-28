import {useState} from 'react';
import Image from '../../common/Image.jsx';

function ProfileSettingsMenu({accountID, displayName, profilePicture, onClose}) {
    const [newName, setNewName] = useState(displayName ?? "");
    const [newPicture, setNewPicture] = useState(profilePicture ?? null);

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
                            <Image size={80} image={profilePicture} alt={"user profile picture"} margin={0} />
                            <h5 className="button"> Change Picture </h5>
                        </div>
                        <input className="login-input" type="text" value={newName} onChange={e => setNewName(e.target.value)} />
                    </div>
                    <div className="save-button">
                        <h2 className="button" onClick={() => {onClose?.();}}> Save </h2>
                        {/* <SaveProfileSettingsButton id={accountID} name={String(newName)} picture={newPicture}/> */}
                    </div>
                </div>
            
            </div>
        </div>
    )
}

export default ProfileSettingsMenu;