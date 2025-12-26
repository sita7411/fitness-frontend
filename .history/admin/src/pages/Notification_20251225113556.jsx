import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Dumbbell,
  Bell,
  PlusCircle,
} from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
});

const THEME = "#e3002a";

const iconMap = {
  workout: Dumbbell,
  success: CheckCircle,
  error: AlertTriangle,
  neutral: MessageCircle,
  bell: Bell,
};

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(
        "http://localhost:5000/api/admin/notifications",
        { withCredentials: true }
      );

      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        setError(data.message || "Failed to load notifications");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Unauthorized";
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Admin access required. Please log in again.");
      } else {
        setError(msg);
      }
      console.error("Fetch notifications failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Connect socket
    if (!socket.connected) {
      socket.connect();
    }

    // Register as admin (assuming there's only one or current admin)
    // You can enhance this later with admin ID if needed
    socket.emit("register", { role: "admin" });

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      // Only add if it's meant for admin (has admin field)
      if (notification.admin) {
        setNotifications((prev) => {
          if (prev.some((n) => n._id === notification._id)) return prev;
          return [notification, ...prev];
        });
      }
    };

    socket.on("notification:new", handleNewNotification);

    // Initial fetch
    fetchNotifications();

    // Cleanup
    return () => {
      socket.off("notification:new", handleNewNotification);
      // Optional: disconnect if no other admin pages are open
      // socket.disconnect();
    };
  }, []);

  const markAllRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/admin/notifications/read-all",
        {},
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/notifications/${id}`, {
        withCredentials: true,
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredNotifications =
    activeTab === "new" || activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-red-600 text-center px-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Notifications</h1>
          <div className="flex gap-3">
            <button
              onClick={markAllRead}
              disabled={notifications.length === 0}
              className="px-5 py-2.5 rounded-lg text-white font-medium disabled:opacity-50 transition hover:opacity-90"
              style={{ background: THEME }}
            >
              Mark all as read
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition">
              <PlusCircle size={20} />
              Send Notification
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-6 border-b border-gray-200">
          {["all", "new", "unread"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? "text-black border-b-2"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={activeTab === tab ? { borderColor: THEME } : {}}
            >
              {tab === "new" ? "New" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const Icon = iconMap[item.icon] || iconMap[item.type] || Bell;
              const isWorkout = item.icon === "workout";

              return (
                <div
                  key={item._id}
                  className="flex items-start justify-between p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg flex-shrink-0"
                      style={{
                        background: isWorkout ? THEME + "22" : "#e5e7eb",
                        color: isWorkout ? THEME : "#6b7280",
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{item.message}</p>
                      {item.createdAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {!item.isRead && (
                      <span
                        className="px-3 py-1 text-xs font-medium text-white rounded-full"
                        style={{ background: THEME }}
                      >
                        New
                      </span>
                    )}
                    <button
                      onClick={() => deleteNotification(item._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Bell size={48} className="mx-auto mb-4 opacity-30" />
              <p>
                No {activeTab === "all" ? "" : activeTab + " "}notifications found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}