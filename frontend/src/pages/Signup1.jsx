
import LoginButton from '../components/LoginButton.jsx';


function SignupPage() {
  return (

    <div id="page">
      
      <div id="login-main">


        <div id="login-container">

          <h2 className="login-header">
          JOIN THE PARTY!
          </h2>

          <p className="login-text"> To get started, enter a display name. (It doesn't have to be your real name.) </p>
          <div>
            <input className="login-input" type="text" placeholder="Name" />
          </div>

          <LoginButton />

        </div>
        
        
      </div>

    </div>
  )
}

export default SignupPage;