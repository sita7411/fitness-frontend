import React, { useState, useEffect } from "react";
import {
  Trash2,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Dumbbell,
  Bell,
  PlusCircle,
} from "lucide-react";
const { adminapi } = useAdminAuth();
import { io } from "socket.io-client";

// Manual socket instance - same as user side
const socket = io("http://localhost:5000", {
  withCredentials: true,
  autoConnect: false, // We control connection manually
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
  const { admin, loading, isLoggedIn, api } = useAdminAuth(); // api → baseURL: /api
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Fetch notifications failed:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (loading || !isLoggedIn || !admin?.id) return;

    // Connect socket only when admin is logged in
    if (!socket.connected) {
      socket.connect();
    }

    fetchNotifications();

    // Register to admin-specific room
    socket.emit("register", { role: "admin", id: admin.id });

    // Real-time new notification listener
    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        // Prevent duplicates
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
    };

    socket.on("notification:new", handleNewNotification);

    // Cleanup: remove listener (socket disconnect context se manage ho raha hai optionally)
    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [loading, isLoggedIn, admin?.id, api]);

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error("Mark all read failed:", err.response?.data || err.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete notification failed:", err.response?.data || err.message);
    }
  };

  const filteredNotifications =
    activeTab === "new" || activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  if (loading) {
    return <p className="text-center mt-10">Loading admin data...</p>;
  }

  if (!isLoggedIn) {
    return <p className="text-center mt-10 text-red-600">Admin login required</p>;
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