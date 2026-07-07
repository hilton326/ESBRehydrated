import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ChatPage from './pages/ChatPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegistrationPage from './pages/RegistrationPage.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Allows multiple pages

// CSS IMPORTS: Only import CSS files in main.jsx, not in individual components or pages
import './styles/main.css';
import './styles/login.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
    </Routes>
  </BrowserRouter>,
)
