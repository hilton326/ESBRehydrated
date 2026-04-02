import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Chat from './Chat.jsx'
import { BrowserRouter, Routes } from 'react-router-dom'; // Allows multiple pages

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
    </Routes>
    <StrictMode>
      <Chat />
    </StrictMode>
  </BrowserRouter>,
)
