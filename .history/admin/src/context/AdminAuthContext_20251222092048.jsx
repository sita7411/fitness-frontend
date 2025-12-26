// src/context/AdminAuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import socket from "../utils/socket";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  const checkAuth = async () => {
  setLoading(true);
  try {
    const res = await api.get("/auth/admin/me");
    
    // YE CORRECT CHECK HAI
    if (res.data.loggedIn && res.data.user) {
      setAdmin(res.data.user);
      setIsLoggedIn(true);
    } else {
      setAdmin(null);
      setIsLoggedIn(false);
    }
  } catch (err) {
    console.error("Admin auth check failed:", err.response?.status, err.response?.data);
    
    // Token invalid ya unauthorized → logout state
    setAdmin(null);
    setIsLoggedIn(false);
  } finally {
    setLoading(false);
  }
};

  // AdminAuthContext.jsx → login function में loading handle करो
  const login = async (email, password) => {
    try {
      setLoading(true);  // ← ADD THIS
      const res = await api.post("/auth/admin/login", { email, password });
      if (res.data.user) {
        setAdmin(res.data.user);
        setIsLoggedIn(true);
        toast.success("Admin logged in!");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);  // ← ADD THIS
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/admin/logout");
    } catch (err) {
      console.error(err);
    } finally {
      socket.disconnect();
      setAdmin(null);
      setIsLoggedIn(false);
      toast.info("Admin logged out");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ admin, isLoggedIn, login, logout, loading, api, setAdmin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};
