// services/notificationService.js → FINAL CLEAN VERSION

import Notification from "../models/Notification.js";

/**
 * Universal function: Admin हो या User, दोनों को notification भेजने के लिए
 */
export const sendNotification = async (
  recipientId,
  role, // "user" या "admin"
  title,
  message,
  type = "neutral",
  icon = "bell"
) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      role,                    // कौन receive कर रहा है (user या admin)
      title,
      message,
      type,
      icon,
      isRead: false,
    });

    // Socket room decide करो role के basis पर
    const room = role === "admin" ? `admin_${recipientId}` : `user_${recipientId}`;

    if (global.io) {
      global.io.to(room).emit("notification:new", notification);
    }

    return notification;
  } catch (error) {
    console.error(`Error sending ${role} notification:`, error);
    throw error; // अगर चाहो तो controller में handle कर लो
  }
};

// Optional: Shortcuts (convenience functions)
export const sendUserNotification = (userId, title, message, type = "neutral", icon = "bell") =>
  sendNotification(userId, "user", title, message, type, icon);

export const sendAdminNotification = (adminId, title, message, type = "neutral", icon = "bell") =>
  sendNotification(adminId, "admin", title, message, type, icon);