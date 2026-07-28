import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';

import ChatController from '../components/main/ChatController.jsx';

import { whoAmI, getProfilePicture } from '../api/client.js'; // For API calls

export default function ChatPage() {
  const navigate = useNavigate();

  /* Loading: Loading state
  loggedIn: Whether a login session was successfully validated
  Account: Account data associated with the login session */
  const [auth, setAuth] = useState({loading: true, loggedIn: false, account: null, profilePicture: null});

  // useEffect since page content is dependent on server validating a login session
  useEffect(() => {
    let mounted = true;
    // Immediately Invoked Function Expression
    (async () => {
      // Contact server, which will validate the login session cookie if present
      const response = await whoAmI();

      /* Make sure the component is still mounted before trying to update state.
      * Ex. If someone navigates away from page while this page is still awaiting the server. */
      if (!mounted) return;

      // If validation not successful, redirect to login page
      if (!response.successful) {
        navigate('/login');
        setAuth({loading: false, loggedIn: false, account: null});
        return;
      }

      // Retrieve profile picture
      const pic = await getProfilePicture();
      // Set account data and stop loading
      setAuth({loading: false, loggedIn: true, account: response.account, profilePicture: pic})
    })();
    // Cleanup function
    return () => {mounted = false};
  }, [navigate, setAuth]);

  // If loading state is set, show loading screen (WIP)
  if (auth.loading) return <div> Loading... </div>;
  // Do not show any content if there is no login session
  if (!auth.loggedIn) return null;

  // Normal content (assuming login session is validated)
  return (
    <div>
      <ChatController account={auth.account} profilePicture={auth.profilePicture} />
    </div>
  );  
}
