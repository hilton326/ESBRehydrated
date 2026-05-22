import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Chat from './pages/Chat.jsx'
import Login from './pages/Login.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Allows multiple pages

// CSS IMPORTS: Only import CSS files in main.jsx, not in individual components or pages
import './styles/main.css';
import './styles/login.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Chat />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </BrowserRouter>,
)
