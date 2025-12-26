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
    baseURL: "http://localhost:5000/api/auth",  // ← Important: /api/auth base
    withCredentials: true,
  });

  const checkAuth = async () => {
    setLoading(true);
    try {
      // अब admin भी /api/auth/me ही call करेगा (path /api/auth है → admin_token भेजेगा)
      const res = await api.get("/me");

      if (res.data.loggedIn && res.data.user?.role === "admin") {
        setAdmin(res.data.user);
        setIsLoggedIn(true);
        socket.connect(); // अगर socket अलग से manage करना है
      } else {
        setAdmin(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Admin auth check failed:", err.response?.data || err.message);
      setAdmin(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      // सही endpoint: /api/auth/admin-login
      const res = await api.post("/admin-login", { email, password });

      if (res.data.user?.role === "admin") {
        setAdmin(res.data.user);
        setIsLoggedIn(true);
        toast.success("Admin logged in successfully!");
        socket.connect();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid admin credentials";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Logout भी /api/auth/logout (user/admin दोनों के लिए same)
      await api.post("/logout");
    } catch (err) {
      console.error("Admin logout error:", err);
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

export const useAdminAuth = () => useContext(AdminAuthContext);