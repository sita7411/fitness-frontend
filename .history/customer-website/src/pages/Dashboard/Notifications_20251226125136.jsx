import React, { useState, useEffect } from "react";
import axios from "axios";
import { getSocket } from "../../utils/socket";
import {
  Trash2,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Dumbbell,
  Bell,
  Activity,
  Crown,
  ShoppingCart,
  Calendar,
} from "lucide-react";

const iconMap = {
  workout: Dumbbell,
  success: CheckCircle,
  error: AlertTriangle,
  neutral: MessageCircle,
  bell: Bell,
  activity: Activity,
  membership: Crown,
  purchase: ShoppingCart,
};

const THEME = "#e3002a";

export default function FitnessNotifications({ currentUserId }) {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from backend - FIXED with console.log + safe check
  const fetchNotifications = async () => {
    try {
      console.log("🔄 Fetching notifications for user:", currentUserId); // Debug
      const { data } = await axios.get(
        "http://localhost:5000/api/notifications",
        { withCredentials: true }
      );

      console.log("📥 API Response:", data); // ← ये देखो console में

      if (data.success) {
        setNotifications(data.notifications || []);
        console.log("✅ Set notifications:", data.notifications?.length || 0);
      } else {
        console.warn("⚠️ API success false:", data);
        setNotifications([]);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err.response?.data || err.message);
      setNotifications([]);
    }
  };

  useEffect(() => {
    console.log("🚀 useEffect running, currentUserId:", currentUserId); // Debug

    if (!currentUserId) {
      console.log("⏭️ No currentUserId, skipping");
      return;
    }

    let isMounted = true;
    const socket = getSocket(); // ← Same socket as Navbar

    // 1. Fetch initial data
    fetchNotifications();

    // 2. Register user for socket
    const registerUser = () => {
      socket.emit("register", { role: "user", id: currentUserId });
      console.log("✅ Socket registered:", currentUserId);
    };

    // Register if connected, else wait for connect
    if (socket.connected) {
      registerUser();
    } else {
      console.log("⏳ Waiting for socket connect...");
      socket.once("connect", registerUser);
    }

    // 3. Listen for real-time notifications
    const handleNewNotification = (notification) => {
      if (!isMounted) return;
      console.log("🔔 New notification received:", notification.title);

      setNotifications((prev) => {
        // Avoid duplicates
        const exists = prev.find((n) => n._id === notification._id);
        if (exists) {
          return prev.map((n) => (n._id === notification._id ? notification : n));
        }
        return [notification, ...prev];
      });
    };

    socket.on("notification:new", handleNewNotification);

    // Cleanup
    return () => {
      isMounted = false;
      socket.off("notification:new", handleNewNotification);
      socket.off("connect", registerUser);
      console.log("🧹 Cleanup done");
    };
  }, [currentUserId]);

  // Mark all as read
  const markAllRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/notifications/read-all",
        {},
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      console.log("✅ All notifications marked as read");
    } catch (err) {
      console.error("❌ Mark all read error:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        withCredentials: true,
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      console.log("✅ Deleted notification:", id);
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete notification. Please try again.");
    }
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.isRead);

  console.log("📊 Current notifications count:", notifications.length, "Filtered:", filteredNotifications.length);

  return (
    <div className="min-h-screen bg-white rounded-lg p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Notifications ({notifications.length})
          </h1>
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition"
            style={{ background: THEME }}
          >
            Mark all as read
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b pb-2 text-gray-600 font-medium">
          {["all", "new", "unread"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 transition-all ${activeTab === tab
                ? "text-black border-b-2 font-semibold"
                : "text-gray-500 hover:text-gray-700"
                }`}
              style={activeTab === tab ? { borderColor: THEME } : {}}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== "all" && ` (${notifications.filter(n => !n.isRead).length})`}
            </button>
          ))}
        </div>

        {/* Notification Cards */}
        <div className="space-y-4">
          {filteredNotifications.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      item.icon === "workout"
                        ? THEME + "22"                 
                        : item.icon === "activity"
                          ? "#10b98122"                    
                          : item.icon === "membership"
                            ? "#fbbf2422"                    
                            : item.icon === "purchase"
                              ? "#3b82f622"                     
                              : item.type === "error"
                                ? "#ff4d4f22"
                                : "#e5e7eb",
                    color:
                      item.icon === "workout"
                        ? THEME                          
                        : item.icon === "activity"
                          ? "#10b981"                      
                          : item.icon === "membership"
                            ? "#fbbf24"                       
                            : item.icon === "purchase"
                              ? "#3b82f6"                       
                              : item.type === "error"
                                ? "#ff4d4f"
                                : "#6b7280",
                  }}
                >
                  {(() => {
                    const Icon = iconMap[item.icon] || iconMap[item.type] || Bell;
                    return <Icon size={22} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-semibold text-[16px] leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {item.message}
                  </p>
                  {item.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {!item.isRead && (
                  <span
                    className="px-3 py-1 rounded-full text-white text-xs font-medium"
                    style={{ background: THEME }}
                  >
                    New
                  </span>
                )}



                <button
                  onClick={() => deleteNotification(item._id)}
                  className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all hover:scale-105"
                  title="Delete notification"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No notifications found</p>
              <p className="text-sm mt-1">
                {activeTab === "all"
                  ? "You have no notifications yet."
                  : "No unread notifications."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}