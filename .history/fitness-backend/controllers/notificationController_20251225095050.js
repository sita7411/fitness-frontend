// controllers/notificationController.js
import Notification from "../models/Notification.js";

const determineRecipientType = (user) => {
  // Direct role check - sabse safe aur reliable
  if (user.role === "admin") {
    return "admin";
  }
  return "user";
};

export const getNotifications = async (req, res) => {
  try {
    console.log("🔔 Notification Request from User ID:", req.user._id); // ← add
    console.log("🔔 User Role:", req.user.role); // ← add

    const recipientType = determineRecipientType(req.user);
    console.log("🔔 Recipient Type:", recipientType); // ← add

    const userId = req.user._id;

    const filter =
      recipientType === "admin"
        ? { admin: userId, user: { $exists: false } }
        : { user: userId, admin: { $exists: false } };

    console.log("🔔 Applied Filter:", filter); // ← add

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    console.log(`🔔 Found ${notifications.length} notifications for ${recipientType}`); // ← add

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      recipientType,
      unreadCount,
      notifications,
    });

  } catch (err) {
    console.error("Get Notifications Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};
export const markAllRead = async (req, res) => {
  try {
    const recipientType = determineRecipientType(req.user);
const userId = req.user._id || req.user.id; // ← ये line change करो
    const filter =
      recipientType === "admin"
        ? { admin: userId, isRead: false, user: { $exists: false } }
        : { user: userId, isRead: false, admin: { $exists: false } };

    const result = await Notification.updateMany(filter, { isRead: true });

    res.json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });

  } catch (err) {
    console.error("Mark All Read Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const recipientType = determineRecipientType(req.user);

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    const ownerId =
      recipientType === "admin" ? notification.admin : notification.user;

    if (
      !ownerId ||
      ownerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (notification.isRead) {
      return res.json({ success: true, message: "Already read" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: "Marked as read",
      notification,
    });

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