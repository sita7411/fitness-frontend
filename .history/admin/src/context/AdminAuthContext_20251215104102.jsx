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
    try {
      const res = await api.get("/admin/me");
      if (res.data.user) {
        setAdmin(res.data.user);
        setIsLoggedIn(true);
      } else {
        setAdmin(null);
        setIsLoggedIn(false);
      }
    } catch {
      setAdmin(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/admin/login", { email, password });
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
    }
  };

  const logout = async () => {
    try {
      await api.post("/admin/logout");
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
