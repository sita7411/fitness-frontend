// src/context/AdminAuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dedicated axios instance for admin APIs
  const api = axios.create({
    baseURL: "http://localhost:5000/api/admin",
    withCredentials: true,
  });

  const adminapi = axios.create({
    baseURL: "http://localhost:5000/api",  // ← यही notifications के लिए
    withCredentials: true,
  });

  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await api.get("/me");

      if (res.data.loggedIn && res.data.user?.role === "admin") {
        setAdmin(res.data.user);
        setIsLoggedIn(true);
      } else {
        setAdmin(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      setAdmin(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post("/login", { email, password });

      if (res.data.loggedIn && res.data.user?.role === "admin") {
        setAdmin(res.data.user);
        setIsLoggedIn(true);
        toast.success("Admin logged in successfully!");
        return { success: true };
      } else {
        toast.error("Invalid admin credentials");
        return { success: false };
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
      await api.post("/logout");
    } catch (err) {
      console.error("Admin logout API error:", err);
    } finally {
      setAdmin(null);
      setIsLoggedIn(false);
      toast.info("Admin logged out");
    }
  };

  // Check auth status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoggedIn,
        login,
        logout,
        loading,
        api,
        checkAuth, // useful if you want to refresh manually
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