
export default function PopupTwoButtons({title, message, yesText, noText, onYes, onNo, isError}) {
    return (
        <div className="overlay">
            <div className={`${isError ? "error-popup" : "popup"}`}>    
                <h4 className="popup-title"> {title} </h4>
                <p className="popup-message"> {message} </p>

                <div className="popup-button-container"> 
                    <button 
                        className="popup-button-yes" 
                        onClick={() => {
                            onYes?.();
                        }}> 
                        {yesText ?? "Yes"} 
                    </button>

                    <button 
                        className="popup-button-no" 
                        onClick={() => {
                            onNo?.();
                        }}> 
                        {noText ?? "No"} 
                    </button>
                </div>

            </div>
            
        </div>
    );
}