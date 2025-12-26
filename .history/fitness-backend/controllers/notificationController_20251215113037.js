import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const type = req.user.type || (req.user.constructor.modelName === "Admin" ? "admin" : "user");
    const filter = type === "admin" ? { admin: req.user._id } : { user: req.user._id };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const type = req.user.type || (req.user.constructor.modelName === "Admin" ? "admin" : "user");
    const filter = type === "admin" ? { admin: req.user._id } : { user: req.user._id };

    await Notification.updateMany(filter, { isRead: true });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
