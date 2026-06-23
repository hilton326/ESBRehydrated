
// Generic image component to more easily support dynamically sized, but restrained, images
const Image = ({ size, image, alt, margin}) => {
    return (
        <div className="image-container"
        style={{width: `${size}px`, height:`${size}px`, margin:`${margin}px`}}>
            <img src={image} alt={alt} className="image"/>
        </div>
    )
}

export default Image;
