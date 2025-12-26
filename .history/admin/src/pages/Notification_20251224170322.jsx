import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Bell,
  Trash2,
  Calendar,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Dumbbell,
} from "lucide-react";

const THEME = "#e3002a";
const socket = io("http://localhost:5000");

export default function AdminNotifications({ adminId }) {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/admin/notifications",
        { withCredentials: true }
      );
      if (data.success) setNotifications(data.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    socket.emit("register", { role: "admin", id: adminId });

    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => socket.off("notification:new");
  }, [adminId]);

  // Mark all as read
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
      console.error(err);
    }
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const filteredNotifications =
    activeTab === "new"
      ? notifications.filter((n) => !n.isRead)
      : activeTab === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications;

  return (
    <div className="p-6 bg-white rounded-lg min-h-screen flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            Notifications
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-lg text-white"
              style={{ background: THEME }}
            >
              Mark all as read
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-200 transition">
              <PlusCircle size={18} /> Send Notification
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b pb-2 text-gray-600 font-medium">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-2 ${activeTab === "all" ? "text-black border-b-2" : "text-gray-500"
              }`}
            style={activeTab === "all" ? { borderColor: THEME } : {}}
          >
            All
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`pb-2 ${activeTab === "new" ? "text-black border-b-2" : "text-gray-500"
              }`}
            style={activeTab === "new" ? { borderColor: THEME } : {}}
          >
            New
          </button>

          <button
            onClick={() => setActiveTab("unread")}
            className={`pb-2 ${activeTab === "unread" ? "text-black border-b-2" : "text-gray-500"
              }`}
            style={activeTab === "unread" ? { borderColor: THEME } : {}}
          >
            Unread
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-5 bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                {/* Icon */}
                <div
                  className="p-3 rounded-lg flex items-center justify-center"
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

                {/* Info */}
                <div>
                  <h3 className="text-gray-900 font-semibold text-[16px]">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{item.message}</p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {!item.isRead && (
                  <span
                    className="px-4 py-1 rounded-lg text-white text-sm"
                    style={{ background: THEME }}
                  >
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
            <p className="text-center text-gray-500 mt-6">
              No notifications found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
