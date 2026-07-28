import React from 'react';
import Image from '../../common/Image.jsx';
import thinkton from '../../../assets/legothinkton.png'; // image placeholder

const MemberInfo = React.memo(function MemberInfo({id, name, pictureData, currentUserID}) {
    // Get profile picture
    const profilePicture = pictureData ?? thinkton;
    
    // Your account's name displays in a different color from the others
    const cssID = (id === currentUserID) ? "member-info-self" : "member-info";

    return (
        <div id={cssID}>
            <Image size={30} image={profilePicture} alt={"user profile picture"} margin={10} />
            <p> {name} </p>
        </div>
    );
});

export default MemberInfo;