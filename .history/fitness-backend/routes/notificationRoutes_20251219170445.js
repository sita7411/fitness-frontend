// routes/notificationRoutes.js
import express from "express";
import {
  getNotifications,
  markAllRead,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protectUnified } from "../middleware/as.js";

const router = express.Router();

router.use(protectUnified);

router.get("/", getNotifications);
router.put("/read-all", markAllRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;