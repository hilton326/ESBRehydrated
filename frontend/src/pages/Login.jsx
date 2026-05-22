
import LoginButton from '../components/LoginButton.jsx';


function Login() {
  return (

    <div id="page">
      
      <div id="login-main">

        <h2 classname="login-header">
          Welcome back!
        </h2>

        <input className="login-input" type="text" placeholder="Username" />
        <input className="login-input" type="password" placeholder="Password" />

        <LoginButton />
        
      </div>

    </div>
  )
}

export default Login