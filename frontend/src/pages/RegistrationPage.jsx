'use client';
import RegisterButton from '../components/login/RegisterButton.jsx';
import { useState } from 'react';

function RegistrationPage() {

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (

    <div id="page">
      <title>Chill - Join the Party! </title>

      <div id="login-main">

        <div id="login-container">

          <h2 className="login-header">
          JOIN THE PARTY!
          </h2>
          <p className="login-text"> Enter your e-mail address: </p>
          <div>
            <input className="login-input" type="text" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <p className="login-text"> Enter a display name (it doesn't have to be your real name): </p>
          <div>
            <input className="login-input" type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div id="outer-password-container">

            <div id="inner-password-container">
              <p className="login-text"> Enter a password: </p>
              <input className="password-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div id="inner-password-container">
              <p className="login-text"> Confirm password: </p>
              <input className="password-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            
          </div>
          
          <RegisterButton email={String(email)} name={String(name)} password={String(password)} confirmPassword={String(confirmPassword)} />

        </div>
        
      </div>

    </div>
  )
}

export default RegistrationPage;