// routes/notificationRoutes.js
import express from "express";
import {
  getNotifications,
  markAllRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js"; 

const router = express.Router();

router.route("/").get(protect, getNotifications);
router.route("/read-all").put(protect, markAllRead);

export default router;