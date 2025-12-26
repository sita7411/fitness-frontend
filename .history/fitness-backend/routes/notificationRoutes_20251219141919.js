// routes/notificationRoutes.js
import express from "express";
import {
  getNotifications,
  markAllRead,
  markAsRead,
  
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js"; 

const router = express.Router();

router.route("/").get(protect, getNotifications);
router.route("/read-all").put(protect, markAllRead);
router.route("/:id/read").patch(protect, markAsRead);        // Single read
router.route("/:id").delete(protect, deleteNotification);
export default router;