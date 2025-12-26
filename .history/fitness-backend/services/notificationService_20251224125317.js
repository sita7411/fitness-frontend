// services/notificationService.js → CORRECTED VERSION

export const sendNotification = async (
  recipientId,
  role, // "user" या "admin" — सिर्फ socket room के लिए use होगा
  title,
  message,
  type = "neutral",
  icon = "bell"
) => {
  try {
    const notificationData = {
      title,
      message,
      type,
      icon,
      isRead: false,
    };

    if (role === "admin") {
      notificationData.admin = recipientId;
    } else {
      notificationData.user = recipientId;
    }

    const notification = await Notification.create(notificationData);

    // Socket room — role-based
    const room = role === "admin" ? `admin_${recipientId}` : `user_${recipientId}`;

    if (global.io) {
      global.io.to(room).emit("notification:new", notification);
    }

    return notification;
  } catch (error) {
    console.error(`Error sending ${role} notification:`, error);
    throw error;
  }
};