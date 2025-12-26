import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Mail,
  Bell,
  Trash2,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Dumbbell,
} from "lucide-react";
import { useUserAuth } from "../../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";

const THEME = "#e3002a";

// Socket instance - controlled connection
const socket = io("http://localhost:5000", {
  autoConnect: false,
  withCredentials: true,
});

const iconMap = {
  workout: Dumbbell,
  success: CheckCircle,
  error: AlertTriangle,
  neutral: MessageCircle,
  bell: Bell,
};

export default function Navbar() {
  const { isLoggedIn, user: authUser, loading } = useUserAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Main logic: Fetch + Socket (Yeh sahi jagah par hai)
  useEffect(() => {
    if (loading || !isLoggedIn || !authUser?._id) {
      setNotifications([]);
      if (socket.connected) socket.disconnect();
      return;
    }

    let isMounted = true;

    if (!socket.connected) {
      socket.connect();
    }
    const fetchNotifications = async () => {
      try {
        console.log("🔍 Fetching notifications..."); // Yeh print hona chahiye
        const response = await axios.get("http://localhost:5000/api/notifications", {
          withCredentials: true,
        });
        console.log("📥 Raw API Response:", response.data); // Yeh dekho kya aa raha hai

        if (response.data.success) {
          console.log("✅ Success - Notifications:", response.data.notifications?.length || 0);
          setNotifications(response.data.notifications || []);
        } else {
          console.log("❌ API success false:", response.data.message);
        }
      } catch (err) {
        console.error("🚨 Fetch Error:", err.response?.data || err.message || err);
      }
    };

    fetchNotifications();

    socket.emit("register", { role: "user", id: authUser._id });

    const handleNewNotification = (notification) => {
      if (!isMounted) return;
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      isMounted = false;
      socket.off("notification:new", handleNewNotification);
    };
  }, [authUser?._id, isLoggedIn, loading]);

  if (loading) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/notifications/read-all",
        {},
        { withCredentials: true }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        withCredentials: true,
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
    }
  };

  return (
    <nav className="fixed top-4 left-4 right-4 md:left-[276px] h-20 px-4 md:px-6 bg-white rounded-2xl shadow-md flex justify-between items-center border border-gray-200 z-50">
      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 w-[180px] sm:w-[240px] md:w-[300px] lg:w-[380px] hover:bg-gray-200 transition">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search tasks..."
          className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400 text-sm"
        />
        <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-gray-500 bg-gray-200 rounded-md">⌘F</kbd>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 md:gap-4">
        <button className="p-3 rounded-xl bg-white shadow-sm hover:bg-red-50 hover:text-red-600 transition">
          <Mail className="w-5 h-5 text-gray-600" />
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative p-3 rounded-xl bg-white shadow-sm hover:bg-red-50 hover:text-red-600 transition"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Notifications ({notifications.length})</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-sm text-[#e3002a] hover:underline font-medium">
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                {notifications.map((notif) => {
  const Icon = iconMap[notif.icon] || iconMap[notif.type] || Bell;
  const isWorkout = notif.icon === "workout";

  return (
    <div
      key={notif._id}
      className={`flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition ${!notif.isRead ? "bg-red-50/30" : ""}`}
    >
      <div
        className="p-2.5 rounded-lg flex-shrink-0"
        style={{
          background: isWorkout 
            ? THEME + "22" 
            : notif.type === "error" 
              ? "#ff4d4f22" 
              : "#f3f4f6",
          color: isWorkout 
            ? THEME 
            : notif.type === "error" 
              ? "#ef4444" 
              : "#6b7280",
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
})}
                )}
              </div>

              {notifications.length > 0 && (
                <a
                  href="/notifications"
                  className="block px-5 py-3 text-center text-sm font-medium text-[#e3002a] hover:bg-red-50 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  View all notifications
                </a>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        {isLoggedIn && authUser ? (
          <a href="/dashboard/myprofile" className="flex items-center gap-3 hover:opacity-80 transition">
            <img
              src={authUser.avatar || "https://i.pravatar.cc/100?img=12"}
              alt="Profile"
              className="w-10 h-10 rounded-full ring-2 ring-gray-200 object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="font-semibold text-gray-800 text-sm">{authUser.name || "Member"}</p>
              <p className="text-xs text-gray-500">{authUser.email}</p>
            </div>
          </a>
        ) : (
          <a href="/login" className="bg-[#e3002a] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm">
            Login / Signup
          </a>
        )}
      </div>
    </nav>
  );
}