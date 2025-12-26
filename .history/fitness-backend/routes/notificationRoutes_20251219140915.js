// routes/notificationRoutes.js
import express from "express";
import {
  getNotifications,
  markAllRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js"; // ye middleware login check karega

const router = express.Router();

// Ye dono routes protect kiye hue hain → sirf logged in user/admin access kar sake
router.route("/").get(protect, getNotifications);
router.route("/read-all").put(protect, markAllRead);

export default router;