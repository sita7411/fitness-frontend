import React, { useState, useEffect, useRef } from "react";
import { Trash2, PlusCircle } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import getSocket from "../utils/socket";

const THEME = "#e3002a";

export default function AdminNotifications() {
  const { admin, loading, isLoggedIn, api } = useAdminAuth();

  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  /* =======================
     FETCH
  ======================= */
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error("❌ Fetch notifications failed");
    }
  };

  /* =======================
     SOCKET INIT
  ======================= */
  useEffect(() => {
    if (loading || !isLoggedIn || !admin?.id) return;

    fetchNotifications();

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) socket.connect();

    socket.emit("register", { role: "admin", id: admin.id });

    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        const exists = prev.some(
          (n) =>
            n._id === notification._id ||
            new Date(n.createdAt).getTime() ===
              new Date(notification.createdAt).getTime()
        );

        if (exists) return prev;
        return [notification, ...prev];
      });
    };

    socket.off("notification:new"); // 🔥 IMPORTANT
    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [loading, isLoggedIn, admin?.id]);

  /* =======================
     ACTIONS
  ======================= */
  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("❌ Delete failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!isLoggedIn) return <p className="text-center mt-10 text-red-600">Login required</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-semibold">Admin Notifications</h1>
        <button className="flex gap-2 px-4 py-2 border rounded">
          <PlusCircle size={18} /> Send
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center">No notifications</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            className="flex justify-between items-center p-4 border rounded mb-3"
          >
            <div>
              <h3 className="font-medium">{n.title}</h3>
              <p className="text-sm text-gray-600">{n.message}</p>
            </div>
            <button
              onClick={() => deleteNotification(n._id)}
              className="text-red-500"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
