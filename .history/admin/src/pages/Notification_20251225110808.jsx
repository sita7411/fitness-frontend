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

  console.log("🔍 RENDER AdminNotifications");
  console.log("   loading:", loading);
  console.log("   isLoggedIn:", isLoggedIn);
  console.log("   admin:", admin);

  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  /* =======================
     FETCH NOTIFICATIONS
  ======================== */
  const fetchNotifications = async () => {
    console.log("🔥 FETCH START → /notifications");

    try {
      const response = await api.get("/notifications");
      console.log("✅ FETCH SUCCESS:", response);

      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
        console.log(
          `📌 Notifications loaded: ${
            response.data.notifications?.length || 0
          }`
        );
      } else {
        console.warn("⚠️ API success false:", response.data);
      }
    } catch (err) {
      console.error(
        "❌ FETCH FAILED:",
        err.response?.status,
        err.response?.data || err.message
      );
    }
  };

  /* =======================
     SOCKET + INIT
  ======================== */
  useEffect(() => {
    console.log("⚙️ useEffect triggered");
    console.log("   loading:", loading);
    console.log("   isLoggedIn:", isLoggedIn);
    console.log("   admin?.id:", admin?.id);

    if (loading) {
      console.log("⏳ STOP → still loading admin auth");
      return;
    }

    if (!isLoggedIn) {
      console.warn("🚫 STOP → admin not logged in");
      return;
    }

    if (!admin?.id) {
      console.warn("🚫 STOP → admin.id missing");
      return;
    }

    console.log("✅ ALL CONDITIONS PASSED");
    console.log("   Admin ID:", admin.id);

    fetchNotifications();

    /* SOCKET CONNECT */
    if (!socket.connected && !socket.connecting) {
      console.log("🔌 Connecting socket...");
      socket.connect();
    } else {
      console.log("🔁 Socket already connected or connecting");
    }

    /* REGISTER ROOM */
    console.log("📡 Registering socket room → admin_" + admin.id);
    socket.emit("register", { role: "admin", id: admin.id });

    /* LISTENER */
    const handleNewNotification = (notification) => {
      console.log("🔔 REALTIME NOTIFICATION RECEIVED:", notification);

      const newNotif = {
        _id: String(notification._id),
        title: notification.title,
        message: notification.message,
        type: notification.type || "success",
        icon: notification.icon || "workout",
        isRead: notification.isRead || false,
        createdAt: notification.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === newNotif._id);
        console.log("   Exists already?", exists);

        if (exists) return prev;
        return [newNotif, ...prev];
      });
    };

    socket.on("notification:new", handleNewNotification);
    console.log("👂 Socket listener attached");

    /* CLEANUP */
    return () => {
      console.log("🧹 Cleanup → removing socket listener");
      socket.off("notification:new", handleNewNotification);
    };
  }, [loading, isLoggedIn, admin?.id]);

  /* =======================
     ACTIONS
  ======================== */
  const markAllRead = async () => {
    console.log("🟢 ACTION → Mark all read");
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      console.log("✅ All marked read");
    } catch (err) {
      console.error("❌ Mark all read failed:", err.response?.data || err.message);
    }
  };

  const deleteNotification = async (id) => {
    console.log("🗑️ ACTION → Delete notification:", id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      console.log("✅ Notification deleted");
    } catch (err) {
      console.error("❌ Delete failed:", err.response?.data || err.message);
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
     RENDER GUARDS
  ======================== */
  if (loading) {
    console.log("⏳ RENDER → Loading screen");
    return <p className="text-center mt-10">Loading admin data...</p>;
  }

  if (!isLoggedIn) {
    console.warn("🚨 RENDER → Not logged in");
    return (
      <p className="text-center mt-10 text-red-600">
        Please log in as admin
      </p>
    );
  }

  /* =======================
     UI
  ======================== */
  return (
    <div className="p-6 bg-white rounded-lg min-h-screen flex justify-center">
      <div className="w-full max-w-5xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Notifications
          </h1>
          <div className="flex gap-3">
            <button
              onClick={markAllRead}
              disabled={notifications.length === 0}
              className="px-4 py-2 rounded-lg text-white disabled:opacity-50"
              style={{ background: THEME }}
            >
              Mark all as read
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border">
              <PlusCircle size={18} /> Send Notification
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => (
              <div key={item._id} className="flex justify-between p-5 border rounded-xl">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.message}</p>
                </div>
                <button
                  onClick={() => deleteNotification(item._id)}
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-10">
              No notifications
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
