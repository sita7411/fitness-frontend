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

  // /admin/src/context/AdminAuthContext.jsx → FINAL FIXED VERSION

  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me"); // ← Same route use karo

      if (
        res.data.loggedIn === true &&
        res.data.user &&
        res.data.user.role === "admin" // ← STRICT CHECK
      ) {
        setAdmin(res.data.user);
        setIsLoggedIn(true);
      } else {
        setAdmin(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Admin auth check failed:", err);
      setAdmin(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/admin/login", { email, password }); // ← Alag endpoint

      // Backend already admin_token set karta hai
      if (res.data.user && res.data.user.role === "admin") {
        setAdmin(res.data.user);
        setIsLoggedIn(true);
        toast.success("Admin logged in successfully!");
        return { success: true };
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // ← Yeh dono cookies clear karega
    } catch (err) {
      console.error(err);
    } finally {
      setAdmin(null);
      setIsLoggedIn(false);
      toast.info("Logged out");
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
