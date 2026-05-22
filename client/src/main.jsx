import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import axios from 'axios'

// Set base URL for production (Vercel) vs Development (Vite Proxy)
// In production, VITE_API_URL should be set in Vercel dashboard.
// In development, it defaults to "" so the proxy works.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
