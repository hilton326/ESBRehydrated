// This component is a simple input field that can be reused across the application. 
// It accepts two props: classname and placeholder. 
// The classname prop allows you to apply custom styles to the input field, while the placeholder prop sets the placeholder text for the input.

const InputField = ({ classname, placeholder }) => {
    return (
        <div>
            <input className={`${classname}`} type="text" placeholder={placeholder} />
        </div>
    )
}

export default InputField;