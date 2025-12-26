import React, { useState, useEffect } from "react";
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
    console.log("🔥 ADMIN: Fetching notifications...");
    try {
      const response = await api.get("/notifications");
      console.log("✅ ADMIN NOTIFICATIONS SUCCESS:", response.data);

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        console.log(`📌 Loaded ${response.data.notifications?.length || 0} admin notifications`);
      }
    } catch (err) {
      console.error("❌ FAILED TO FETCH ADMIN NOTIFICATIONS", err.response?.data || err.message);
    }
  };

  /* =======================
     SOCKET + INIT
  ======================== */
  useEffect(() => {
    console.log("useEffect triggered – loading:", loading, "isLoggedIn:", isLoggedIn);

    if (loading || !isLoggedIn || !admin?.id) {
      return;
    }

    console.log("All conditions passed – Admin ID:", admin.id);
    fetchNotifications();

    // Safe connect – duplicate calls avoid करो
    if (!socket.connected && !socket.connecting) {
      console.log("Connecting socket...");
      socket.connect();
    }

    // Register room
    socket.emit("register", { role: "admin", id: admin.id });
    console.log("Registered socket as admin:", admin.id);

    // Listener for new notifications
    const handleNewNotification = (notification) => {
      console.log("🔔 New real-time notification received:", notification);

      // Critical Fix: _id ko string mein convert kar do
      const normalizedNotification = {
        ...notification,
        _id: notification._id.toString(),  // ← YEH LINE SABSE IMPORTANT!
        // Baaki fields safe kar lo (optional but good)
        title: notification.title || "",
        message: notification.message || "",
        type: notification.type || "neutral",
        icon: notification.icon || "bell",
        isRead: notification.isRead || false,
        createdAt: notification.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => {
        // Duplicate check bhi _id string se karo
        const exists = prev.some((n) => n._id === normalizedNotification._id);
        if (exists) return prev; 

        return [normalizedNotification, ...prev];
      });
    };

    socket.on("notification:new", handleNewNotification);

    // Cleanup
    return () => {
      console.log("Cleanup: Removing notification listener");
      socket.off("notification:new", handleNewNotification);
    };
  }, [loading, isLoggedIn, admin?.id]);

  /* =======================
     ACTIONS
  ======================== */
  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      console.log("Marked all as read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      console.log("Deleted notification:", id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
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
     RENDER
  ======================== */
  if (loading) return <p className="text-center mt-10">Loading admin data...</p>;
  if (!isLoggedIn) return <p className="text-center mt-10 text-red-600">Please log in as admin</p>;

  return (
    <div className="p-6 bg-white rounded-lg min-h-screen flex justify-center">
      <div className="w-full max-w-5xl">
        {/* HEADER */}
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
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => (
              <div
                key={item._id}
                className="flex justify-between p-5 bg-white rounded-xl shadow-sm border hover:shadow-md transition"
              >
                <div className="flex gap-4">
                  <div
                    className="p-3 rounded-lg flex-shrink-0"
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
                    {item.icon === "workout" ? <Dumbbell size={22} /> :
                      item.type === "success" ? <CheckCircle size={22} /> :
                        item.type === "error" ? <AlertTriangle size={22} /> :
                          <MessageCircle size={22} />}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.message}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {!item.isRead && (
                    <span className="px-3 py-1 rounded-lg text-white text-sm font-medium" style={{ background: THEME }}>
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
            ))
          ) : (
            <p className="text-center text-gray-500 mt-10 text-lg">
              {notifications.length === 0 ? "No notifications yet." : "No unread notifications."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}