
export default function Popup({title, message, onConfirm}) {
    return (
    <div className="overlay">
        <div className="popup">   
            <h4 className="popup-title"> {title} </h4>
            <p className="popup-message"> {message} </p>

            <div className="popup-button-container"> 
                <button 
                    className="popup-button" 
                    onClick={() => {
                        onConfirm?.();
                    }}> 
                    Yes 
                </button>
            </div>

        </div>
    </div>);
}