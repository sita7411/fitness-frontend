// routes/notificationRoutes.js
import express from "express";
import {
  getNotifications,
  markAllRead,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js"; 

const router = express.Router();

router.route("/").get(protectUnified, getNotifications);
router.route("/read-all").put(protectUnified, markAllRead);
router.route("/:id/read").patch(protectUnified, markAsRead);       
router.route("/:id").delete(protectUnified, deleteNotification);
export default router;