import Notification from "../models/Notification.js";

export const sendNotification = async (
  recipientId,
  role,
  title,
  message,
  type = "neutral",
  icon = "bell"
) => {
  const data = { title, message, type, icon, isRead: false };

  if (role === "admin") data.admin = recipientId;
  else data.user = recipientId;

  const notification = await Notification.create(data);

  const room = role === "admin"
    ? `admin_${recipientId}`
    : `user_${recipientId}`;

  if (global.io) {
    global.io.to(room).emit("notification:new", notification);
  }

  return notification;
};
