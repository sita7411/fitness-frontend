import express from "express";
import {
  getNotifications,
  markAllRead,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protectUnified } from "../middleware/authUnified.js"; // ← यही नया

const router = express.Router();

// सब routes पर unified protection
router.use(protectUnified);

router.get("/", getNotifications);
router.put("/read-all", markAllRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;