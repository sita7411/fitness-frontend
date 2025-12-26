import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import axios from "axios";

// Axios global settings (important for cookies)
axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;  // ← Cookie bhejne ke liye zaroori

// Render the app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);