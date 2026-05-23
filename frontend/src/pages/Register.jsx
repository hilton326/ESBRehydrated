
import LoginButton from '../components/LoginButton.jsx';


function Register() {
  return (

    <div id="page">
      
      <div id="login-main">


        <div id="login-container">

          <h2 className="login-header">
          JOIN THE PARTY!
          </h2>

          <p className="login-text"> Enter a username: </p>
          <input className="login-input" type="text"/>
          <p className="login-text"> Enter a password: </p>
          <input className="login-input" type="password"/>

          <LoginButton />

        </div>
        
        
      </div>

    </div>
  )
}

export default Register