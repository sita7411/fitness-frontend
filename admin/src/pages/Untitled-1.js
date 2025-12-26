import React, { useState } from "react";
import {
  Bell,
  Trash2,
  Calendar,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
} from "lucide-react";

const THEME = "#e3002a";

const adminNotifications = [
  {
    id: 1,
    title: "New User Joined",
    message: "A new member registered today.",
    icon: <CheckCircle size={22} />,
    type: "success",
    new: true,
    date: "21/12/2025",
  },
  {
    id: 2,
    title: "Payment Pending",
    message: "5 users have pending membership payments.",
    icon: <AlertTriangle size={22} />,
    type: "error",
    new: true,
    date: "21/12/2025",
  },
  {
    id: 3,
    title: "Workout Plan Updated",
    message: "Trainer updated the HIIT plan for multiple users.",
    icon: <Calendar size={22} />,
    type: "success",
    new: false,
    date: "19/12/2025",
  },
  {
    id: 4,
    title: "New Trainer Query",
    message: "A user asked a question in the message center.",
    icon: <MessageCircle size={22} />,
    type: "neutral",
    new: false,
    date: "18/12/2025",
  },
];

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState(adminNotifications);

  // Filters
  const filteredNotifications =
    activeTab === "new"
      ? notifications.filter((n) => n.new)
      : activeTab === "unread"
      ? notifications.filter((n) => n.new)
      : notifications;

  // Mark all as read
  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        new: false,
      }))
    );
  };

  // Delete
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

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

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-200 transition"
            >
              <PlusCircle size={18} /> Send Notification
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b pb-2 text-gray-600 font-medium">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-2 ${
              activeTab === "all" ? "text-black border-b-2" : "text-gray-500"
            }`}
            style={activeTab === "all" ? { borderColor: THEME } : {}}
          >
            All
          </button>

          <button
            onClick={() => setActiveTab("new")}
            className={`pb-2 ${
              activeTab === "new" ? "text-black border-b-2" : "text-gray-500"
            }`}
            style={activeTab === "new" ? { borderColor: THEME } : {}}
          >
            New
          </button>

          <button
            onClick={() => setActiveTab("unread")}
            className={`pb-2 ${
              activeTab === "unread" ? "text-black border-b-2" : "text-gray-500"
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
              key={item.id}
              className="flex items-center justify-between p-5 bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="p-3 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      item.type === "error"
                        ? "#ff4d4f22"
                        : item.type === "success"
                        ? THEME + "22"
                        : "#e5e7eb",
                    color:
                      item.type === "error"
                        ? "#ff4d4f"
                        : item.type === "success"
                        ? THEME
                        : "gray-700",
                  }}
                >
                  {item.icon}
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
                {item.new && (
                  <span
                    className="px-4 py-1 rounded-lg text-white text-sm"
                    style={{ background: THEME }}
                  >
                    New
                  </span>
                )}

                <span className="text-gray-500 text-sm">{item.date}</span>

                <button
                  onClick={() => deleteNotification(item.id)}
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
