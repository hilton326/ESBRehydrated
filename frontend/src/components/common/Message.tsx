import '../../styles/main.css'
import Image from './Image.tsx'

/* A message needs: 
* A user profile picture: type Image
* A username: String
* A timestamp: String
*/

interface Attributes {
    username: string;
    profile_picture: string;
    body: string;
    timestamp: string;
}

// Generic image component to more easily support dynamically sized, but restrained, images
const Message: React.FC<Attributes> = ({ username, profile_picture, body, timestamp}) => {
    return (
        <div>
            {username}
            <Image size={30} image={profile_picture} alt={"user profile picture"} />
            {body}
            {timestamp}
        </div>
    )
}

export default Message;
