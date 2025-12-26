// src/components/Navbar.jsx
import React, { useRef, useState } from "react";
import { Search, Mail, Bell, Settings, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext"; 

export default function Navbar({ hideNavbar = false }) {
  const navigate = useNavigate();
  const { admin, isLoggedIn, loading, logout } = useAdminAuth(); 

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout(); // ← Context का logout use करो (cookie clear + socket disconnect)
    setDropdownOpen(false);
    navigate("/login", { replace: true });
  };

  if (hideNavbar) return null;

  return (
    <nav className="fixed top-4 left-[276px] right-4 h-20 px-4 md:px-6 bg-white rounded-2xl shadow-md flex justify-between items-center border border-gray-200 z-50">
      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 w-[280px]">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search tasks..."
          className="bg-transparent outline-none w-full text-gray-700"
          autoComplete="off"
        />
      </div>

      {/* Right Side Icons + Profile */}
      <div className="flex items-center gap-4">
        <button
          className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center hover:bg-[#e3002a]/10 transition"
          onClick={() => navigate("/messages")}
          title="Messages"
        >
          <Mail className="w-5 h-5 text-gray-600" />
        </button>

        <button
          className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center hover:bg-[#e3002a]/10 transition"
          onClick={() => navigate("/notifications")}
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        <button
          className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center hover:bg-[#e3002a]/10 transition"
          onClick={() => navigate("/settings")}
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        {/* Loading Spinner */}
        {loading && (
          <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#e3002a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Not Logged In → Show Login Button */}
        {!isLoggedIn && !loading && (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#e3002a] to-[#ff4d4d] hover:from-[#cc0023] hover:to-[#e6002a] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Shield className="w-4 h-4" />
            Login
          </button>
        )}

        {isLoggedIn && admin && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-[#e3002a]/5 to-[#ff4d4d]/5 px-3 py-2 rounded-xl hover:from-[#e3002a]/10 hover:to-[#ff4d4d]/10 border border-[#e3002a]/20 transition-all group"
            >
              <img
                src={admin.avatar || "https://i.pravatar.cc/40?img=3"}
                alt="Admin"
                className="w-10 h-10 rounded-full ring-2 ring-[#e3002a]/30 shadow-sm"
                onError={(e) => (e.target.src = "https://i.pravatar.cc/40?img=3")}
              />
              <div className="hidden md:flex flex-col leading-tight">
                <span className="font-semibold text-gray-800 truncate max-w-[120px]">
                  {admin.name || "Admin"}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-[120px]">
                  {admin.email}
                </span>
              </div>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <button
                  onClick={() => {
                    navigate("/my-account");
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#e3002a]/5 transition"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  My Account
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#e3002a]/5 transition"
                >
                  <Shield className="w-4 h-4 text-gray-500" />
                  Settings
                </button>
                <div className="border-t border-gray-100 my-1 mx-4"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
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