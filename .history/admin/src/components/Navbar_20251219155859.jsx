import React, { useEffect, useState, useRef } from "react";
import { Search, Mail, Bell, Settings, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiCall = async (endpoint, options = {}) => {
  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": options.contentType || "application/json",
    },
    credentials: "include", 
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("admin");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
};

export default function Navbar({ hideNavbar = false }) {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // ✅ LOGIN API CALL
  const handleLogin = async (email, password) => {
    try {
      const response = await apiCall("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // ✅ PROFILE API CALL
  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await apiCall("/admin/me");
      setAdmin(response.user);
      return response.user;
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
      setAdmin(null);
      localStorage.removeItem("admin");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT API CALL
  const handleLogout = async () => {
    try {
      await apiCall("/admin/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAdmin(null);
      localStorage.removeItem("admin");
      setDropdownOpen(false);
      navigate("/login", { replace: true });
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const isLoggedIn = !!admin && !loading;

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (hideNavbar) return null;

  return (
    <nav className="fixed top-4 left-[276px] right-4 h-20 px-4 md:px-6 bg-white rounded-2xl shadow-md flex justify-between items-center border border-gray-200 z-50">
      {/* Search */}
      <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 w-[280px]">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search tasks..."
          className="bg-transparent outline-none w-full text-gray-700"
          autoComplete="off"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Mail */}
        <button
          className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#e3002a]/10 transition-colors duration-200"
          onClick={() => navigate("/messages")}
          title="Messages"
        >
          <Mail className="w-5 h-5 text-gray-600" />
        </button>

        {/* Notifications */}
        <button
          className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#e3002a]/10 transition-colors duration-200"
          onClick={() => navigate("/notifications")}
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        {/* Settings */}
        <button
          className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#e3002a]/10 transition-colors duration-200"
          onClick={() => navigate("/settings")}
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        {/* Loading state */}
        {loading && (
          <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#e3002a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Login Button */}
        {!isLoggedIn && !loading && (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#e3002a] to-[#ff4d4d] hover:from-[#cc0023] hover:to-[#e6002a] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Shield className="w-4 h-4" />
            Login
          </button>
        )}

        {/* Profile Dropdown */}
        {isLoggedIn && admin && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-[#e3002a]/5 to-[#ff4d4d]/5 px-3 py-2 rounded-xl hover:from-[#e3002a]/10 hover:to-[#ff4d4d]/10 border border-[#e3002a]/20 transition-all duration-300 group"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={admin.avatar || "https://i.pravatar.cc/40?img=3"}
                alt="profile"
                className="w-10 h-10 rounded-full ring-2 ring-[#e3002a]/30 shadow-sm"
                onError={(e) => {
                  e.target.src = "https://i.pravatar.cc/40?img=3";
                }}
              />
              <div className="hidden md:flex flex-col leading-tight min-w-0">
                <span className="font-semibold text-gray-800 truncate max-w-[120px]">
                  {admin.name}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-[120px]">
                  {admin.email}
                </span>
              </div>
              <div className="md:hidden w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    navigate("/my-account");
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#e3002a]/5 hover:to-[#ff4d4d]/5 rounded-t-2xl transition-all duration-200"
                >
                  <Settings className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  My Account
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#e3002a]/5 hover:to-[#ff4d4d]/5 transition-all duration-200"
                >
                  <Shield className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-2xl transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

