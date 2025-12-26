import express from "express";
import {
  getNotifications,
  markAllRead,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protect, adminprotect } from "../middleware/auth.js";  // ← दोनों import

const router = express.Router();

router.use(protect);     
router.use(adminprotect);

router.get("/", (req, res, next) => {
  console.log("🚀 ADMIN NOTIFICATIONS ROUTE HIT! User:", req.user?.id, "Role:", req.user?.role);
  next();
}, getNotifications);

router.put("/read-all", markAllRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;