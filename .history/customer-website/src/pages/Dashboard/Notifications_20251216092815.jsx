import React, { useState, useEffect } from "react";
import axios from "axios";
// import { io } from "socket.io-client";
import {
  Trash2,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Dumbbell,
  Bell,
} from "lucide-react";
const iconMap = {
  workout: Dumbbell,     // 💪 FIXED
  success: CheckCircle,
  error: AlertTriangle,
  neutral: MessageCircle,
  bell: Bell,
};


const THEME = "#e3002a";
const socket = io("http://localhost:5000"); // backend

export default function FitnessNotifications({ currentUserId }) {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/notifications",
        { withCredentials: true }
      );

      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Register user for socket
    socket.emit("register", { role: "user", id: currentUserId });

    // Listen for real-time notifications
    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => socket.off("notification:new");
  }, [currentUserId]);

  // Mark all as read
  const markAllRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/notifications/read-all",
        {},  // empty body is fine
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Delete notification locally
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };
  
  // Filtered notifications
  const filteredNotifications =
    activeTab === "new"
      ? notifications.filter((n) => !n.isRead)
      : activeTab === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications;

  return (
    <div className="min-h-screen bg-white rounded-lg p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-lg text-white"
            style={{ background: THEME }}
          >
            Mark all as read
          </button>
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
          {filteredNotifications.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg flex items-center justify-center"
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
                          : "gray",
                  }}
                >
                  {(() => {
                    const Icon =
                      iconMap[item.icon] || iconMap[item.type] || Bell;
                    return <Icon size={22} />;
                  })()}
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-[16px]">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.message}</p>
                </div>
              </div>

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
