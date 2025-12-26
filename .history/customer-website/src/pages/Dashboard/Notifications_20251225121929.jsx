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

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/notifications",
        { withCredentials: true }
      );

      if (data.success) {
        // Sort newest first
        const sorted = (data.notifications || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    fetchNotifications();

    const socket = window.appSocket;

    // Debug logs (remove in production if you want)
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });

    // Ensure connected
    if (!socket.connected) {
      socket.connect();
    }

    // Register user
    socket.emit("register", { role: "user", id: currentUserId });

    // New notification handler
    const handleNewNotification = (notification) => {
      console.log("🔔 New notification received:", notification);

      setNotifications((prev) => {
        // Prevent duplicate
        if (prev.some((n) => n._id === notification._id)) return prev;

        // Add at top and sort again
        const updated = [notification, ...prev];
        return updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("connect");
      socket.off("connect_error");
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

  // Delete notification
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

  // Filter
  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.isRead);

  // Improved date formatting (timezone safe)
  const formatDate = (dateString) => {
    if (!dateString) return "Just now";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return "Yesterday";

    // Format as MM/DD/YYYY or local
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllRead}
              className="px-6 py-3 rounded-xl text-white font-medium transition hover:opacity-90 shadow-md"
              style={{ background: THEME }}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b-2 border-gray-200 pb-4">
          {["all", "unread"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-lg font-medium capitalize transition ${
                activeTab === tab
                  ? "text-gray-900 border-b-4"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={activeTab === tab ? { borderColor: THEME } : {}}
            >
              {tab === "all" ? "All" : "Unread"}
              {tab === "unread" && notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-xl text-gray-500">
                {activeTab === "all"
                  ? "No notifications yet."
                  : "You're all caught up!"}
              </p>
              <p className="text-gray-400 mt-2">
                New notifications will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const Icon = iconMap[item.icon] || iconMap[item.type] || Bell;
              const isWorkout = item.icon === "workout";

              return (
                <div
                  key={item._id}
                  className={`flex items-center justify-between p-6 rounded-2xl transition-all hover:shadow-lg ${
                    !item.isRead
                      ? "bg-red-50 border-l-4 border-l-red-500"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="p-4 rounded-xl flex-shrink-0"
                      style={{
                        background: isWorkout
                          ? THEME + "22"
                          : item.type === "error"
                          ? "#ff4d4f22"
                          : "#f3f4f6",
                        color: isWorkout
                          ? THEME
                          : item.type === "error"
                          ? "#ef4444"
                          : "#6b7280",
                      }}
                    >
                      <Icon size={28} />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{item.message}</p>
                      <p className="text-sm text-gray-400 mt-3">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {!item.isRead && (
                      <span
                        className="px-4 py-2 rounded-full text-white font-medium text-sm"
                        style={{ background: THEME }}
                      >
                        New
                      </span>
                    )}
                    <button
                      onClick={() => deleteNotification(item._id)}
                      className="p-3 text-red-500 bg-red-100 rounded-xl hover:bg-red-200 transition"
                    >
                      <Trash2 size={20} />
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