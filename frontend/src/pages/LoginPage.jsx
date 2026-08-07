'use client';
import LoginButton from '../components/login/LoginButton.jsx';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  return (
    <div>
      <title> Welcome Back! - ESB Rehydrated </title>

      <div id="login-main">

        <div id="login-container">

          <h2 className="login-header">
          WELCOME BACK!
          </h2>

          <p className="login-text"> Email: </p>
          <div>
            <input className="login-input" type="text" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <p className="login-text"> Password: </p>
          <div>
            <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <LoginButton email={String(email)} password={String(password)} />

          <p className="button" onClick={() => navigate('/register')}> Not registered yet? </p>

        </div>
        
      </div>

    </div>
  )
}

export default LoginPage;