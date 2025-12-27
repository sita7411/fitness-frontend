import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import { UserAuthProvider } from "./context/AuthContext";
import "./index.css";

import axios from "axios";

// ✅ Use ENV based API (local + live)
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ShopProvider>
      <UserAuthProvider>
        <App />
      </UserAuthProvider>
    </ShopProvider>
  </BrowserRouter>
);
