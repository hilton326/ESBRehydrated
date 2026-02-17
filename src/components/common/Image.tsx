import '../../styles/main.css'

interface Attributes {
    size: number;
    image: string;
    alt: string;
}

// Generic image component to more easily support dynamically sized, but restrained, images
const Image: React.FC<Attributes> = ({ size, image, alt}) => {
    return (
        <div className="image-container"
        style={{width: `${size}px`, height:`${size}px`}}>
            <img src={image} alt={alt} className="image"/>
        </div>
    )
}

export default Image;
