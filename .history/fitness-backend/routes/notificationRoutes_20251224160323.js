import express from "express";
import {
  getNotifications,
  markAllRead,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";           // सिर्फ protect
import { adminprotect } from "../middleware/auth.js";       // अलग से admin routes के लिए

const router = express.Router();

// User और Admin दोनों के लिए notifications common हैं → सिर्फ authenticated user
router.use(protect);  // ← adminprotect हटाओ यहाँ से

router.get("/", getNotifications);
router.put("/read-all", markAllRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);   

export default router;