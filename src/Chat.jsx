
import './styles/main.css'
import TitleBar from './components/TitleBar'
import UserMenu from './components/UserMenu'

function Chat() {

  /* What needs to happen in main.css:
  * Layer 1: flex-row containing 2 divs, one 80vw, one 20vw. Both 100vh.
  * Layer 2.1: flex-col containing 3 components (navbar, message display, input area)
  * Layer 2.2: flex-col containing 3 components (account menu, member list, DMs list) 
  */
  return (

    <div className="page">
      
      <div className="main">
        <TitleBar/>
        <TitleBar/>
        <TitleBar/>
      </div>

      <div className="sidebar">
        <UserMenu username={"PlanKrab"} />
        <TitleBar/>
        <TitleBar/>
      </div>
    </div>
  )
}

export default Chat
