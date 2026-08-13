import React from 'react';
import Image from '../../common/Image.jsx';
import thinkton from '../../../assets/legothinkton.png'; // image placeholder

import {useWindowWidth} from '../../../hooks/useWindowSize.js';

const MemberInfo = React.memo(function MemberInfo({id, name, pictureData, walkingGary, currentUserID}) {
    // Get profile picture
    const profilePicture = pictureData ?? thinkton;
    
    // Your account's name displays in a different color from the others
    const cssID = (id === currentUserID) ? "member-info-self" : "member-info";

    const pageWidth = useWindowWidth();

    function calculateImageSize() {
        if (pageWidth < 700) return 0;
        if (pageWidth < 800) return 20;
        if (pageWidth < 900) return 30;
        return 40;
    }

    return (
        <div id={cssID}>
            <Image size={calculateImageSize()} image={profilePicture} alt={"user profile picture"} margin={10} />
            <div className="member-name-container">
                <p> {name} </p>
                {walkingGary && <p id="walking-gary-text"> Walking Gary </p>}
            </div>
            
        </div>
    );
});

export default MemberInfo;