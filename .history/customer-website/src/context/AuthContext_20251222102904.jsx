// src/context/UserAuthContext.jsx → FINAL FIXED & PRODUCTION READY (December 22, 2025)

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // App startup loading

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  // Initial auth check on app load
  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me");

      // STRICT CHECK: Only accept normal users (role !== "admin")
      if (res.data.loggedIn && res.data.user) {
  if (res.data.user.role === "admin") {
    console.log("🚫 Blocked admin login in user context");
    setUser(null);
    setIsLoggedIn(false);
  } else {
    setUser(res.data.user);
    setIsLoggedIn(true);
    console.log("✅ [USER CONTEXT] Authenticated as user:", res.data.user.email);
  }
} else {
  setUser(null);
  setIsLoggedIn(false);
}
3. AdminAuth

  // User Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

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
        toast.error(res.data.message || "Invalid credentials");
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

  // Check auth on mount
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
        checkAuth,
        setUser,
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