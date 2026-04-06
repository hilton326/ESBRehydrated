
import TitleBar from '../components/TitleBar.jsx'
import MessageDisplay from '../components/MessageDisplay.jsx'
import ProfileDisplay from '../components/ProfileDisplay.jsx'

function Login() {
  return (

    <div id="page">
      
      <div id="main">
        <TitleBar/>
        LOGIN
        <MessageDisplay/>
      </div>

      <div id="sidebar">
        <ProfileDisplay />
        
      </div>
    </div>
  )
}

export default Login