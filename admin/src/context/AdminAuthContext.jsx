// src/context/AdminAuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Axios instance (no withCredentials needed anymore)
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  // Add token to every request automatically
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ---------------- AUTH CHECK ----------------
  const checkAuth = async () => {
    setLoading(true);
    const token = localStorage.getItem("admin_token");

    if (!token) {
      setAdmin(null);
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    try {
      // Assuming your backend has a unified /api/auth/me that works for both
      // If you have separate /api/admin/me, change it here
      const res = await api.get("/api/auth/me");

      if (res.data.loggedIn && res.data.user?.role === "admin") {
        setAdmin(res.data.user);
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem("admin_token");
        setAdmin(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      localStorage.removeItem("admin_token");
      setAdmin(null);
      setIsLoggedIn(false);
      console.error("Admin auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ADMIN LOGIN ----------------
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/api/admin/login", { email, password });

      if (res.data.loggedIn && res.data.token && res.data.user?.role === "admin") {
        localStorage.setItem("admin_token", res.data.token); // Save token
        setAdmin(res.data.user);
        setIsLoggedIn(true);
        toast.success("Admin logged in successfully!");
        return { success: true };
      } else {
        toast.error(res.data.message || "Invalid admin credentials");
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid admin credentials";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/api/admin/logout"); // Optional: backend can invalidate if needed
      toast.info("Admin logged out successfully");
    } catch (err) {
      console.error("Admin logout error:", err);
      toast.warn("Logged out locally");
    } finally {
      localStorage.removeItem("admin_token");
      setAdmin(null);
      setIsLoggedIn(false);
      setLoading(false);
    }
  };

  // Check auth on app load
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoggedIn,
        loading,
        login,
        logout,
        api,
        checkAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
