import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import axios from "axios";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:5000"; 


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
