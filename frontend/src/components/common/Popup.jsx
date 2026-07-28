
export default function Popup({title, message, buttonText, onConfirm, isError}) {
    return (
        <div className="overlay">
            { isError ? ( 
                <div className="error-popup">   
                    <h4 className="popup-title"> {title} </h4>
                    <p className="popup-message"> {message} </p>
                    
                    <div className="popup-button-container"> 
                        <button 
                            className="error-popup-button" 
                            onClick={() => {
                                onConfirm?.();
                            }}> 
                            {buttonText} 
                        </button>
                    </div>

                </div>
            ) : ( 
                <div className="popup">   
                    <h4 className="popup-title"> {title} </h4>
                    <p className="popup-message"> {message} </p>
                    
                    <div className="popup-button-container"> 
                        <button 
                            className="popup-button" 
                            onClick={() => {
                                onConfirm?.();
                            }}> 
                            {buttonText}
                        </button>
                    </div>

                </div>
            )}
            
        </div>
    );
}