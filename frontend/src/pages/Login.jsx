'use client';
import LoginButton from '../components/LoginButton.jsx';
import { useState } from 'react';

function LoginPage() {
  const [emailOrName, setEmailOrName] = useState('');
  const [password, setPassword] = useState('');

  return (

    <div id="page">
      
      <div id="login-main">

        <div id="login-container">

          <h2 className="login-header">
          WELCOME BACK!
          </h2>

          <p className="login-text"> Email or display name: </p>
          <div>
            <input className="login-input" type="text" value={emailOrName} onChange={e => setEmailOrName(e.target.value)} />
          </div>

          <p className="login-text"> Password: </p>
          <div>
            <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <LoginButton emailOrName={emailOrName} password={password} />

        </div>
        
      </div>

    </div>
  )
}

export default LoginPage;