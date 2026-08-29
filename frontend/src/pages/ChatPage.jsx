import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';

import ChatController from '../components/main/ChatController.jsx';

import { whoAmI } from '../api/AuthClient.js';

// ChatPage (/chat): Main page. 
export default function ChatPage() {
  const navigate = useNavigate();

  /* Loading: Loading state,
    loggedIn: Whether a login session was successfully validated
    Account: Account data associated with the login session */
  const [auth, setAuth] = useState({loading: true, loggedIn: false, account: null});

  // Page content is dependent on valid login session
  useEffect(() => {
    let mounted = true;
    // Immediately Invoked Function Expression: Useful for async operations inside a useEffect
    (async () => {
      // Contact server, which will validate the login session cookie if present
      const response = await whoAmI();

      /* Make sure the component is still mounted before trying to update state.
      * Ex. If someone navigates away from page while this page is still awaiting the server. */
      if (!mounted) return;

      // If validation not successful, redirect to login page
      if (!response.successful) {
        navigate('/login');
        setAuth({loading: false, loggedIn: false, account: null, profilePicture: null});
        return;
      }
      // If validation successful, update the account data
      setAuth({loading: false, loggedIn: true, account: response.account})
    })();
    // Cleanup function
    return () => {mounted = false};
  }, [navigate, setAuth]);

  // If loading state is set, show loading screen (WIP)
  if (auth.loading) {
    console.log("Loading...");
    return <div> Loading... </div>;
  }
  
  // Do not show any content if there is no login session
  if (!auth.loggedIn) return null;

  // Normal content (assuming login session is validated)
  return (
    <div>
      <title> Special:Chat - ESB Rehydrated </title>
      <ChatController accountInfo={auth.account}/>
    </div>
  );  
}
