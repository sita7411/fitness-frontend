// src/components/Navbar.jsx (Admin Navbar - Final Version)
import React, { useRef, useState, useEffect } from "react";
import {
  Search,
  Mail,
  Settings,
  Shield,
  LogOut,
  Bell,
  Trash2,
  Dumbbell,
  CheckCircle,
  AlertTriangle,
  Calendar,
  MessageCircle,
  Activity,
  Crown,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { getSocket } from "../utils/socket";
const THEME = "#e3002a";
const iconMap = {
  workout: Dumbbell,
  success: CheckCircle,
  error: AlertTriangle,
  neutral: MessageCircle,
  bell: Bell,
  activity: Activity,
  membership: Crown,
  purchase: ShoppingCart,
  calendar: Calendar,
};

export default function Navbar({ hideNavbar = false }) {
  const navigate = useNavigate();
  const { admin, isLoggedIn, loading, logout, api } = useAdminAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications + Socket setup
  useEffect(() => {
    if (loading || !isLoggedIn) return;

    let isMounted = true;
    const socket = getSocket();

    const fetchNotifications = async () => {
      try {
        const { data } = await api.get(`/api/admin/notifications`);
        if (data.success && isMounted) {
          const notifs = data.notifications || [];
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n) => !n.isRead).length);
        }
      } catch (err) {
        console.error("Admin navbar: Fetch notifications error:", err);
      }
    };

    fetchNotifications();

    // Register as admin on socket
    const registerAdmin = () => {
      socket.emit("register", { role: "admin" });
    };

    if (socket.connected) {
      registerAdmin();
    } else {
      socket.once("connect", registerAdmin);
    }

    // Handle new incoming notification
    const handleNewNotification = (notif) => {
      if (!isMounted || !notif.admin) return;

      setNotifications((prev) => {
        if (prev.some((n) => n._id === notif._id)) {
          return prev.map((n) => (n._id === notif._id ? notif : n));
        }
        return [notif, ...prev];
      });

      if (!notif.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      isMounted = false;
      socket.off("connect", registerAdmin);
      socket.off("notification:new", handleNewNotification);
    };
  }, [isLoggedIn, loading]);

  // Mark all as read
  const markAllRead = async () => {
    try {
      await api.put(
        `/api/admin/notifications/read-all`,
        {},
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Admin mark all read error:", err);
    }
  };

  // Delete single notification
  const deleteNotification = async (id) => {
    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifications((prev) => {
        const updated = prev.filter((n) => n._id !== id);
        setUnreadCount(updated.filter((n) => !n.isRead).length);
        return updated;
      });
    } catch (err) {
      console.error("Admin delete notification error:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
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

      {/* Right Side Icons + Dropdowns */}
      <div className="flex items-center gap-4">


        {/* Notification Bell + Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-3 rounded-xl bg-white shadow-sm hover:bg-red-50 hover:text-red-600 transition"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-600 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown (Same as User) */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">
                  Notifications ({notifications.length})
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-sm text-[#e3002a] hover:underline font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* List */}
              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    // Icon selection using iconMap (priority: icon field > type field > fallback)
                    const Icon = iconMap[notif.icon] || iconMap[notif.type] || Bell;

                    // Background & color logic - consistent with full notifications page
                    let bgColor = "#f3f4f6";     // default neutral
                    let iconColor = "#6b7280";

                    if (notif.icon === "workout") {
                      bgColor = THEME + "22";       // #e3002a22
                      iconColor = THEME;            // #e3002a
                    } else if (notif.icon === "calendar") {
                      bgColor = "#8b5cf622";        // purple background
                      iconColor = "#8b5cf6";        // purple icon
                    } else if (notif.icon === "activity") {
                      bgColor = "#10b98122";        // emerald
                      iconColor = "#10b981";
                    } else if (notif.icon === "membership") {
                      bgColor = "#fbbf2422";        // amber
                      iconColor = "#fbbf24";
                    } else if (notif.icon === "purchase") {
                      bgColor = "#3b82f622";        // blue
                      iconColor = "#3b82f6";
                    } else if (notif.type === "error") {
                      bgColor = "#ff4d4f22";
                      iconColor = "#ef4444";
                    } else if (notif.type === "success") {
                      bgColor = "#10b98122";
                      iconColor = "#10b981";
                    }

                    return (
                      <div
                        key={notif._id}
                        className={`flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition ${!notif.isRead ? "bg-red-50/30" : ""
                          }`}
                      >
                        <div
                          className="p-2.5 rounded-lg flex-shrink-0"
                          style={{
                            background: bgColor,
                            color: iconColor,
                          }}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notif.title || "Notification"}
                          </p>
                          {notif.message && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {notif.createdAt
                              ? new Date(notif.createdAt).toLocaleString()
                              : "Just now"}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif._id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              {/* View All */}
              {notifications.length > 0 && (
                <a
                  href="/admin/notifications"
                  className="block px-5 py-3 text-center text-sm font-medium text-[#e3002a] hover:bg-red-50 transition border-t border-gray-100"
                  onClick={() => setNotifDropdownOpen(false)}
                >
                  View all notifications
                </a>
              )}
            </div>
          )}
        </div>

        {/* Settings */}
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

        {/* Not Logged In */}
        {!isLoggedIn && !loading && (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#e3002a] to-[#ff4d4d] hover:from-[#cc0023] hover:to-[#e6002a] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Shield className="w-4 h-4" />
            Login
          </button>
        )}

        {/* Profile Dropdown */}
        {isLoggedIn && admin && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
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

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <button
                  onClick={() => {
                    navigate("/my-account");
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#e3002a]/5 transition"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  My Account
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setProfileDropdownOpen(false);
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
