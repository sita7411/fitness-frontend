import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Dumbbell,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import socket from "../utils/socket";

/* =======================
   CONFIG
======================= */
const THEME = "#e3002a";

/* =======================
   COMPONENT
======================= */
export default function AdminNotifications() {
  const { admin, loading, isLoggedIn, api } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  /* =======================
     FETCH NOTIFICATIONS
  ======================== */
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      console.log("Fetch notifications response:", data);
      if (data.success) setNotifications(data.notifications);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  /* =======================
     SOCKET + INIT
  ======================== */
  useEffect(() => {
    if (loading || !admin?._id) return; // wait until admin is loaded
    console.warn("Admin ID is undefined, cannot register socket");
    return;
  }

    console.log("Admin ID:", admin._id);

  // Initial load
  fetchNotifications();

  // Ensure socket is connected
  if (!socket.connected) socket.connect();

  socket.on("connect", () => console.log("🟢 SOCKET CONNECTED:", socket.id));
  socket.on("disconnect", () => console.log("🔴 SOCKET DISCONNECTED"));

  // Join admin room
  console.log("Registering admin room via socket...");
  socket.emit("register", { role: "admin", id: admin._id });

  // Realtime listener
  const handleNewNotification = (notification) => {
    console.log("🔔 NEW ADMIN NOTIFICATION RECEIVED:", notification);
    setNotifications((prev) => [notification, ...prev]);
  };
  socket.on("notification:new", handleNewNotification);

  // Cleanup
  return () => {
    socket.off("notification:new", handleNewNotification);
  };
}, [admin]);

/* =======================
   ACTIONS
======================== */
const markAllRead = async () => {
  try {
    await api.put("/notifications/read-all");
    console.log("Marked all notifications as read");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  } catch (err) {
    console.error("Mark all read error:", err);
  }
};

const deleteNotification = async (id) => {
  try {
    await api.delete(`/notifications/${id}`);
    console.log("Deleted notification ID:", id);
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
if (loading) return <p>Loading...</p>;
if (!isLoggedIn) return <p>Please log in as admin</p>;

/* =======================
   UI
======================== */
return (
  <div className="p-6 bg-white rounded-lg min-h-screen flex justify-center">
    <div className="w-full max-w-5xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>

        <div className="flex gap-3">
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-lg text-white"
            style={{ background: THEME }}
          >
            Mark all as read
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-200">
            <PlusCircle size={18} /> Send Notification
          </button>
        </div>
      </div>

      {/* TABS */}
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

      {/* LIST */}
      <div className="space-y-4">
        {filteredNotifications.map((item) => (
          <div
            key={item._id}
            className="flex justify-between p-5 bg-white rounded-xl shadow-sm border"
          >
            <div className="flex gap-4">
              {/* ICON */}
              <div
                className="p-3 rounded-lg"
                style={{
                  background:
                    item.icon === "workout"
                      ? THEME + "22"
                      : item.type === "error"
                        ? "#ff4d4f22"
                        : item.type === "success"
                          ? THEME + "22"
                          : "#e5e7eb",
                  color:
                    item.icon === "workout"
                      ? THEME
                      : item.type === "error"
                        ? "#ff4d4f"
                        : item.type === "success"
                          ? THEME
                          : "#666",
                }}
              >
                {item.icon === "workout" ? (
                  <Dumbbell size={22} />
                ) : item.type === "success" ? (
                  <CheckCircle size={22} />
                ) : item.type === "error" ? (
                  <AlertTriangle size={22} />
                ) : (
                  <MessageCircle size={22} />
                )}
              </div>

              {/* CONTENT */}
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.message}</p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
              {!item.isRead && (
                <span className="px-3 py-1 rounded-lg text-white text-sm" style={{ background: THEME }}>
                  New
                </span>
              )}

              <span className="text-gray-500 text-sm">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>

              <button
                onClick={() => deleteNotification(item._id)}
                className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No notifications found.</p>
        )}
      </div>
    </div>
  </div>
);
}
