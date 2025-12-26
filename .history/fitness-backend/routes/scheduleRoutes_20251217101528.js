// routes/scheduleRoutes.js

import express from "express";
import {
  getMemberSchedule,
  getAdminSchedule,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
  markEventCompleted,
  deleteEventsBySource,
} from "../controllers/scheduleController.js";

import { protect } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();


router.route("/").get(protect, getMemberSchedule);

router.route("/").post(protect, createScheduleEvent);
router.route("/:id").put(protect, updateScheduleEvent);

router.route("/:id").delete(protect, deleteScheduleEvent);

router.route("/:id/complete").patch(protect, markEventCompleted);


router.route("/admin").get(protect, admin, getAdminSchedule);

router
  .route("/source/:sourceType/:sourceId")
  .delete(protect, admin, deleteEventsBySource);

export default router;