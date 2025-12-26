import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import { UserAuthProvider } from "./context/AuthContext"; 
import "./index.css";

import axios from "axios";
axios.defaults.withCredentials = true;   
axios.defaults.baseURL = "http://localhost:5000"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ShopProvider>
      <UserAuthProvider>  
        <App />
      </UserAuthProvider> 
    </ShopProvider>
  </BrowserRouter>
);