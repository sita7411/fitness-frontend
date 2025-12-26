import React, { useState, useEffect } from "react";
import {
  Trash2,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Dumbbell,
  Bell,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import socket from "../utils/socket";

/* =======================
   CONFIG
======================= */
const THEME = "#e3002a";

const iconMap = {
  workout: Dumbbell,
  success: CheckCircle,
  error: AlertTriangle,
  neutral: MessageCircle,
  bell: Bell,
};

export default function AdminNotifications() {
  const { admin, loading, isLoggedIn, api } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  /* =======================
     FETCH NOTIFICATIONS
  ======================== */
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (err) {
      console.error("FAILED TO FETCH ADMIN NOTIFICATIONS", err);
    }
  };

  /* =======================
     SOCKET + INIT
  ======================== */
  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) return;

    fetchNotifications();

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("register", { role: "admin", id: admin.id });

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [loading, isLoggedIn, admin]);

  /* =======================
     ACTIONS
  ======================== */
  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  /* =======================
     FILTERING
  ======================== */
  const filteredNotifications =
    activeTab === "new" || activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  /* =======================
     LOADING OR UNAUTHORIZED
  ======================== */
  if (loading) {
    return <p className="text-center mt-10">Loading admin data...</p>;
  }

  if (!isLoggedIn) {
    return <p className="text-center mt-10 text-red-600">Please log in as admin</p>;
  }

  /* =======================
     UI (ab user notification page jaisa)
  ======================== */
  return (
    <div className="min-h-screen bg-white rounded-lg p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>

          <div className="flex gap-3">
            <button
              onClick={markAllRead}
              disabled={notifications.length === 0}
              className="px-4 py-2 rounded-lg text-white disabled:opacity-50"
              style={{ background: THEME }}
            >
              Mark all as read
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-200">
              <PlusCircle size={18} /> Send Notification
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b pb-2 text-gray-600 font-medium">
          {["all", "new", "unread"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${activeTab === tab ? "text-black border-b-2" : "text-gray-500"}`}
              style={activeTab === tab ? { borderColor: THEME } : {}}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Notification Cards */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
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
                          : "#666",
                    }}
                  >
                    {(() => {
                      const Icon = iconMap[item.icon] || iconMap[item.type] || Bell;
                      return <Icon size={22} />;
                    })()}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-gray-900 font-semibold text-[16px]">{item.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.message}</p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                  {!item.isRead && (
                    <span
                      className="px-4 py-1 rounded-lg text-white text-sm"
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
            ))
          ) : (
            <p className="text-center text-gray-500 mt-6">
              {notifications.length === 0
                ? "No notifications yet."
                : "No unread notifications."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}