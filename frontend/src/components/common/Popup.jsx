export default function Popup({title, message, buttonText, onConfirm, isError}) {
    return (
        <div className="overlay">
                <div className={`${isError ? "error-popup" : "popup"}`}>   
                    <h4 className="popup-title"> {title} </h4>
                    <p className="popup-message"> {message} </p>
                    
                    <div className="popup-button-container"> 
                        <button 
                            className={`${isError ? "error-popup-button" : "popup-button"}`}
                            onClick={() => {
                                onConfirm?.();
                            }}> 
                            {buttonText} 
                        </button>
                    </div>
                </div>
        </div>
    );
}