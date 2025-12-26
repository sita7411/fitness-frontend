import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Dumbbell,
  Bell,
} from "lucide-react";

const iconMap = {
  workout: Dumbbell,
  success: CheckCircle,
  error: AlertTriangle,
  neutral: MessageCircle,
  bell: Bell,
};

const THEME = "#e3002a";

export default function FitnessNotifications({ currentUserId }) {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/notifications",
        { withCredentials: true }
      );

      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    fetchNotifications();

    // Global socket from App.jsx
    const socket = window.appSocket;

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Register this user
    socket.emit("register", { role: "user", id: currentUserId });

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        // Prevent duplicates (if _id same ho)
        const exists = prev.some((n) => n._id === notification._id);
        if (exists) return prev;

        // Add new notification at top
        return [notification, ...prev];
      });
    };

    socket.on("notification:new", handleNewNotification);

    // Cleanup: remove listener when component unmounts or user changes
    return () => {
      socket.off("notification:new", handleNewNotification);
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
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  // Delete single notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        withCredentials: true,
      });

      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete notification. Please try again.");
    }
  };

  // Filtered notifications
  const filteredNotifications =
    activeTab === "new" || activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  // Better date formatting
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white rounded-lg p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-lg text-white transition hover:opacity-90"
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
              className={`pb-2 capitalize transition ${
                activeTab === tab
                  ? "text-black font-semibold border-b-2"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={activeTab === tab ? { borderColor: THEME } : {}}
            >
              {tab === "new" ? "New" : tab === "unread" ? "Unread" : "All"}
            </button>
          ))}
        </div>

        {/* Notification Cards */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <p className="text-center text-gray-500 mt-10 py-8">
              No {activeTab === "all" ? "" : activeTab} notifications found.
            </p>
          ) : (
            filteredNotifications.map((item) => {
              const Icon = iconMap[item.icon] || iconMap[item.type] || Bell;
              const isWorkout = item.icon === "workout";

              return (
                <div
                  key={item._id}
                  className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border transition hover:shadow-md ${
                    !item.isRead ? "border-l-4 border-l-red-500" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isWorkout
                          ? THEME + "22"
                          : item.type === "error"
                          ? "#ff4d4f22"
                          : "#e5e7eb",
                        color: isWorkout
                          ? THEME
                          : item.type === "error"
                          ? "#ff4d4f"
                          : "#6b7280",
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="text-gray-900 font-semibold text-[16px]">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{item.message}</p>
                      <p className="text-gray-400 text-xs mt-2">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
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
                      className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}