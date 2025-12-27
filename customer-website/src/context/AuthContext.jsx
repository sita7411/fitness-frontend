// src/context/UserAuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ek hi Axios instance – sab requests ke liye
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,  // Yeh sabse important hai – cookie bhejne ke liye
  });

  // ---------------- AUTH CHECK ----------------
  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/auth/me");
      if (res.data.loggedIn && res.data.user) {
        setUser(res.data.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      setUser(null);
      setIsLoggedIn(false);
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOGIN ----------------
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      if (res.data.loggedIn && res.data.user) {
        setUser(res.data.user);
        setIsLoggedIn(true);
        toast.success("Login successful!");
        return { success: true };
      } else {
        toast.error(res.data.message || "Login failed");
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
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
      await api.post("/api/auth/logout");
      toast.info("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      toast.warn("Logged out locally");
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
    }
  };

  // ---------------- EXAMPLE: FETCH CLASSES ----------------
  const fetchUserClasses = async () => {
    try {
      const res = await api.get("/api/classes/user");
      return res.data;
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      throw err;
    }
  };

  // Check auth on app load
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isLoggedIn,
        loading,
        login,
        logout,
        api,              // Ab yeh hi use karo har jagah
        setUser,
        checkAuth,
        fetchUserClasses,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};
