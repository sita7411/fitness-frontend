import React, { useState, useRef, useEffect } from "react";
import { Search, Mail, Bell, Trash2, CheckCircle, AlertTriangle, MessageCircle, Dumbbell } from "lucide-react";
import { useUserAuth } from "../../context/AuthContext";
import axios from "axios";
// import { io } from "socket.io-client";

const THEME = "#e3002a";
 const socket = io("http://localhost:5000"); // adjust backend URL if needed

/Map notification types/icons
const iconMap = {
  workout: Dumbbell,
  success: CheckCircle,
  error: AlertTriangle,
  neutral: MessageCircle,
  bell: Bell,
};

export default function Navbar() {
  // ------------------- ALL HOOKS FIRST (unconditional) -------------------
  const { isLoggedIn, user: authUser, loading } = useUserAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // First useEffect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Second useEffect
  useEffect(() => {
    // Only run fetch and socket logic when not loading and user exists
    if (loading || !authUser?._id) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/notifications", {
          withCredentials: true,
        });
        if (data.success) setNotifications(data.notifications);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();

    socket.emit("register", { role: "user", id: authUser._id });

    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off("notification:new");
    };
  }, [authUser, loading]); // Add loading to deps so it re-runs when loading changes

  // -------- EARLY RETURN: Now 100% safe --------
  if (loading) {
    return null;
  }

  // ---------- Variables & Functions (after all hooks) ----------
  const userToShow = authUser;

  const markAllRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/notifications/read-all",
        {},
        { withCredentials: true }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

 // ---------- JSX ---------
  return (
    <nav className="fixed top-4 left-[276px] right-4 md:left-[276px] sm:left-4 left-4 h-20 px-4 md:px-6 bg-white rounded-2xl shadow-md flex justify-between items-center border border-gray-200 z-50 transition-all duration-300">

      {/* Search Section */}
      <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 w-[150px] sm:w-[200px] md:w-[280px] lg:w-[360px] transition-all duration-300 hover:bg-gray-200">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search tasks..."
          className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400 text-sm"
        />
        <span className="hidden sm:flex text-xs text-gray-400 px-2 py-1 border border-gray-300 rounded-md select-none">
          ⌘F
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* Mail Icon */}
        <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white shadow-sm rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-[#e3002a]/10 hover:text-[#e3002a]">
          <Mail className="w-5 h-5 text-gray-600" />
        </div>

        {/* Notifications Icon with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="w-9 h-9 sm:w-12 sm:h-12 bg-white shadow-sm rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-[#e3002a]/10 hover:text-[#e3002a]"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500"></span>
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center font-semibold text-gray-800">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <ul className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => {
                    const Icon = iconMap[notif.icon] || iconMap[notif.type] || Bell;
                    const bgColor =
                      notif.icon === "workout"
                        ? THEME + "22"
                        : notif.type === "error"
                          ? "#ff4d4f22"
                          : "#e5e7eb";
                    const color =
                      notif.icon === "workout"
                        ? THEME
                        : notif.type === "error"
                          ? "#ff4d4f"
                          : "gray";

                    return (
                      <li
                        key={notif._id}
                        className={`flex justify-between items-start gap-3 px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${!notif.isRead ? "bg-gray-50 font-semibold" : ""
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Icon */}
                          <div className="p-2 rounded-lg flex items-center justify-center" style={{ background: bgColor, color }}>
                            <Icon size={20} />
                          </div>

                          {/* Text */}
                          <div className="flex flex-col">
                            <span className="text-gray-900">{notif.title || notif.message}</span>
                            {notif.createdAt && (
                              <span className="text-gray-400 text-xs mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => deleteNotification(notif._id)}
                          className="p-1 text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <li className="px-4 py-2 text-gray-500 text-sm text-center">No notifications</li>
                )}
              </ul>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-2 border-t border-gray-100 text-center text-sm text-blue-600 hover:bg-gray-100 cursor-pointer">
                  View All
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Section */}
        {isLoggedIn && userToShow ? (
          <a href="/dashboard/myprofile" className="flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300">
            <img
              src={userToShow.avatar || "https://i.pravatar.cc/100?img=12"}
              alt={userToShow.name || "Profile"}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-1 ring-gray-300"
            />
            <div className="hidden md:flex flex-col leading-tight">
              <span className="font-semibold text-gray-800">{userToShow.name || "Member"}</span>
              <span className="text-sm text-gray-500">{userToShow.email || "member@example.com"}</span>
            </div>
          </a>
        ) : (
          <a href="/login" className="bg-[#E3002A] hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium">
            Login / Signup
          </a>
        )}
      </div>
    </nav>
  );
}
