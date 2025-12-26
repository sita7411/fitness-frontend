// controllers/notificationController.js
import Notification from "../models/Notification.js";

const determineRecipientType = (user) => {
  // Priority: explicit 'type' field (if you add later)
  if (user.type) return user.type;

  // Fallback: Check model name (reliable in Mongoose)
  if (user.constructor.modelName === "Admin") return "admin";
  if (user.constructor.modelName === "User") return "user";

  // Final fallback (rare case)
  return user.role === "admin" ? "admin" : "user";
};

export const getNotifications = async (req, res) => {
  try {
    const recipientType = determineRecipientType(req.user);
    const filter = recipientType === "admin" 
      ? { admin: req.user._id } 
      : { user: req.user._id };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(100) // Safe limit
      .lean();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      notifications,
      unreadCount,
      recipientType // Optional: frontend ko batao kon hai
    });

  } catch (err) {
    console.error("Get Notifications Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const recipientType = determineRecipientType(req.user);
    const filter = recipientType === "admin"
      ? { admin: req.user._id, isRead: false }
      : { user: req.user._id, isRead: false };

    const result = await Notification.updateMany(filter, { isRead: true });

    res.json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount
    });

  } catch (err) {
    console.error("Mark All Read Error:", err);
    res.status(500).json({ success: false, message: "Failed to mark notifications as read" });
  }
};

// Bonus: Single notification read mark karne ke liye (useful for mobile/web)
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const recipientType = determineRecipientType(req.user);

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    // Ownership check
    const ownerId = recipientType === "admin" ? notification.admin : notification.user;
    if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (notification.isRead) {
      return res.json({ success: true, message: "Already read" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: "Marked as read", notification });

  } catch (err) {
    console.error("Mark As Read Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Bonus: Delete a notification (optional)
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const recipientType = determineRecipientType(req.user);

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    const ownerId = recipientType === "admin" ? notification.admin : notification.user;
    if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await notification.deleteOne();

    res.json({ success: true, message: "Notification deleted" });

  } catch (err) {
    console.error("Delete Notification Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};