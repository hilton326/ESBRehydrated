
import './styles/main.css'
import TitleBar from './components/TitleBar'
import MessageDisplay from './components/MessageDisplay.jsx'
import ProfileDisplay from './components/ProfileDisplay.jsx'

function Chat() {

  /* What needs to happen in main.css:
  * Layer 1: flex-row containing 2 divs, one 80vw, one 20vw. Both 100vh.
  * Layer 2.1: flex-col containing 3 components (navbar, message display, input area)
  * Layer 2.2: flex-col containing 3 components (account menu, member list, DMs list) 
  */
  return (

    <div id="page">
      
      <div id="main">
        <TitleBar/>
        <MessageDisplay/>
      </div>

      <div id="sidebar">
        <ProfileDisplay />
        
      </div>
    </div>
  )
}

export default Chat
