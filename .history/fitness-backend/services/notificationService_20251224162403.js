// services/notificationService.js
import Notification from "../models/Notification.js";
import { io } from "../server.js"; // agar socket.io server.js mein init hai, warna jahan se import karte ho

export const sendNotification = async (
  recipientId,
  recipientType,  // "user" ya "admin"
  title,
  message,
  type = "neutral",
  icon = "bell"
) => {
  const payload = {
    title,
    message,
    type,
    icon,
  };

  if (recipientType === "admin") {
    payload.admin = recipientId;
  } else {
    payload.user = recipientTypeId;  // default user
  }

  const notification = new Notification(payload);
  await notification.save();

  // Real-time socket push (optional but good)
  const socketData = {
    _id: notification._id,
    ...payload,
    isRead: false,
    createdAt: notification.createdAt,
  };

  // Emit to correct room
  io.to(`${recipientType}-${recipientId}`).emit("notification:new", socketData);

  return notification;
};