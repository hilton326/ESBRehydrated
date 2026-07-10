
export default function MemberList({memberList}) {
    // console.log(memberList);
    // for (let m = 0; m < memberList.length; m++) {
    //     console.log(memberList[m]);
    // }
    return (
        <div id="member-list">
            {memberList.map(member => (
                <li key={member.id}>
                    {member.name}
                </li>
            ))}
        </div>
    );
}