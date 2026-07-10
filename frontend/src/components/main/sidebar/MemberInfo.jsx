import React from 'react';
import Image from '../../common/Image.jsx';
import thinkton from '../../../assets/legothinkton.png'; // image placeholder

const MemberInfo = React.memo(function MemberInfo({name, picture}) {

    return (
        <div>
            <p> {name} </p>
        </div>
    );
});

export default MemberInfo;