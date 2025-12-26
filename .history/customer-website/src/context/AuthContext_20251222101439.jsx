// src/context/UserAuthContext.jsx → FINAL PRODUCTION VERSION (December 22, 2025)

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // App startup loading

  // Axios instance with cookie support
  const api = axios.create({
    baseURL: "http://localhost:5000/api", // Change to env variable in production
    withCredentials: true,
  });

  // Check current authenticated user
  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me");

      // ⭐ STRICT CHECK: Only accept NON-ADMIN users
      if (
        res.data.loggedIn &&
        res.data.user &&
        res.data.user.role !== "admin" // ← Yeh line sabse important hai
      ) {
        setUser(res.data.user);
        setIsLoggedIn(true);
        console.log("✅ [USER CONTEXT] Normal user authenticated:", res.data.user.email);
      } else {
        // Agar admin token se data aaya → reject (customer app mein admin nahi dikhna chahiye)
        setUser(null);
        setIsLoggedIn(false);
        console.log("❌ [USER CONTEXT] Rejected: Admin token detected or not logged in");
      }
    } catch (err) {
      console.error("User auth check failed:", err.response?.status || err.message);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // Normal User Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email: email.trim().toLowerCase(), password });

      // Extra safety: Confirm it's not an admin
      if (
        res.data.loggedIn &&
        res.data.user &&
        res.data.user.role !== "admin"
      ) {
        setUser(res.data.user);
        setIsLoggedIn(true);
        toast.success("Login successful!");
        return { success: true };
      } else {
        toast.error("Invalid credentials or access denied");
        return { success: false };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
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

  // Check auth on app mount
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
        api,
        checkAuth, // Optional: manual refresh
        setUser,   // Optional: manual update
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