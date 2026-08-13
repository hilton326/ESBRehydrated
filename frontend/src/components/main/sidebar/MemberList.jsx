import MemberInfo from './MemberInfo.jsx';

export default function MemberList({accountID, memberList}) {
    // console.log(memberList);
    // for (let m = 0; m < memberList.length; m++) {
    //     console.log(memberList[m]);
    // }

    return (
        <div id="member-list">
            {memberList.map((member) => (
                <MemberInfo 
                    key={member.id}
                    id={member.id}
                    name={member.name}
                    pictureData={member.profilePicture}
                    walkingGary={member.walkingGary}
                    currentUserID={accountID}
                />
            ))}
        </div>
    );
}