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
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("register", { role: "admin" });

    const handleNewNotification = (notification) => {
      if (notification.admin) {
        setNotifications((prev) => {
          if (prev.some((n) => n._id === notification._id)) return prev;
          return [notification, ...prev];
        });
      }
    };

    socket.on("notification:new", handleNewNotification);

    fetchNotifications();

    return () => {
      socket.off("notification:new", handleNewNotification);
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
      const response = await axios.delete(
        `http://localhost:5000/api/admin/notifications/${id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      } else {
        alert("Failed to delete: " + response.data.message);
      }
    } catch (err) {
      console.error("Delete notification error:", err);
      const msg = err.response?.data?.message || "Failed to delete notification";
      alert(msg);
    }
  };
  const filteredNotifications =
    activeTab === "new" || activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-red-600 text-center px-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-lg p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Admin Notifications
          </h1>
          <div className="flex gap-3">
            <button
              onClick={markAllRead}
              disabled={notifications.length === 0}
              className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50"
              style={{ background: THEME }}
            >
              Mark all as read
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition">
              <PlusCircle size={20} />
              Send Notification
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b pb-2 text-gray-600 font-medium">
          {["all", "new", "unread"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${activeTab === tab
                  ? "text-black border-b-2"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              style={activeTab === tab ? { borderColor: THEME } : {}}
            >
              {tab === "new" ? "New" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Notification Cards */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const Icon = iconMap[item.icon] || iconMap[item.type] || Bell;

              return (
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
                            : item.type === "error"
                              ? "#ff4d4f22"
                              : "#e5e7eb",
                        color:
                          item.icon === "workout"
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
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {!item.isRead && (
                      <span
                        className="px-4 py-1 rounded-lg text-white text-sm font-medium"
                        style={{ background: THEME }}
                      >
                        New
                      </span>
                    )}

                    {item.createdAt && (
                      <span className="text-gray-500 text-sm">
                        {new Date(item.createdAt).toLocaleDateString()}
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