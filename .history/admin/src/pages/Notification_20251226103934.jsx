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
  Crown,
  ShoppingCart,
  Activity,
} from "lucide-react";
import { getSocket } from "../utils/socket.js";

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

      console.log("Admin Notifications API Response:", data);

      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        setError(data.message || "Failed to load notifications");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Network error";
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Admin access denied. Please log in again.");
      } else {
        setError(msg);
      }
      console.error("Admin fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const socket = getSocket();

    // Manual connect if needed
    if (!socket.connected) {
      socket.connect();
    }

    // Register as admin
    const registerAdmin = () => {
      socket.emit("register", { role: "admin" });
      console.log("Admin registered on socket");
    };

    if (socket.connected) {
      registerAdmin();
    } else {
      socket.once("connect", registerAdmin);
    }

    // Listen for new admin notifications
    const handleNewNotification = (notification) => {
      if (!isMounted) return;
      if (notification.admin) { // backend में admin: true होनी चाहिए
        console.log("New admin notification:", notification.title);
        setNotifications((prev) => {
          if (prev.some((n) => n._id === notification._id)) {
            return prev.map((n) => (n._id === notification._id ? notification : n));
          }
          return [notification, ...prev];
        });
      }
    };

    socket.on("notification:new", handleNewNotification);

    // Initial fetch
    fetchNotifications();

    // Cleanup
    return () => {
      isMounted = false;
      socket.off("notification:new", handleNewNotification);
      socket.off("connect", registerAdmin);
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
      console.error("Admin mark all read failed:", err);
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
      console.error("Admin delete notification error:", err);
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.isRead);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading admin notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-[#e3002a] text-white rounded-lg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-lg p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Admin Notifications ({notifications.length})
          </h1>
          <div className="flex gap-3">
            <button
              onClick={markAllRead}
              disabled={notifications.length === 0}
              className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 hover:opacity-90 transition"
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
              className={`pb-2 transition-all ${activeTab === tab
                ? "text-black border-b-2 font-semibold"
                : "text-gray-500 hover:text-gray-700"
                }`}
              style={activeTab === tab ? { borderColor: THEME } : {}}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== "all" && (
                <span className="ml-2 text-xs">
                  ({notifications.filter((n) => !n.isRead).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification List - Scrollable */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
                              ? "#10b981"                       // Green
                              : item.icon === "membership"
                                ? "#fbbf24"                       // Golden yellow icon
                                : item.icon === "purchase"
                                  ? "#3b82f6"                       // Blue icon
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
                    <div className="flex-1">
                      <h3 className="text-gray-900 font-semibold text-[16px]">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{item.message}</p>
                      {item.createdAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition hover:scale-105"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">
                No {activeTab === "all" ? "" : "unread "}notifications
              </p>
              <p className="text-sm mt-2">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}