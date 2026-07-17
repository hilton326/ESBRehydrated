
export default function PopupYesNo({title, message, onYes, onNo}) {
    return (
    <div className="overlay">
        <div className="popup">   
            <h4 className="popup-title"> {title} </h4>
            <p className="popup-message"> {message} </p>

            <div className="popup-button-container"> 
                <button 
                    className="popup-button-yes" 
                    onClick={() => {
                        onYes?.();
                    }}> 
                    Yes 
                </button>

                <button 
                    className="popup-button-no" 
                    onClick={() => {
                        onNo?.();
                    }}> 
                    No
                </button>
            </div>

        </div>
        
    </div>);
}