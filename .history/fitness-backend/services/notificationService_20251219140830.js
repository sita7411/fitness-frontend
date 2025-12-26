// services/notificationService.js
import Notification from "../models/Notification.js";

export const sendNotification = async (userId, title, message, type = "neutral", icon = "bell") => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      icon,
      isRead: false
    });

    // Socket emit (server.js mein io available hona chahiye)
    if (global.io) {
      global.io.to(`user_${userId}`).emit("notification:new", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// Admin ke liye
export const sendAdminNotification = async (adminId, title, message, type = "neutral") => {
  try {
    const notification = await Notification.create({
      admin: adminId,
      title,
      message,
      type,
      isRead: false
    });

    if (global.io) {
      global.io.to(`admin_${adminId}`).emit("notification:new", notification);
    }
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
};