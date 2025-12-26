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

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==================================================================
// MEMBER ROUTES (Normal logged-in user ke liye)
// ==================================================================

// GET /api/schedule?month=2025-12
// → Current user ka personal schedule fetch karta hai
router.route("/").get(protect, getMemberSchedule);

// POST /api/schedule
// → Naya workout/event create (manual ya assigned)
router.route("/").post(protect, createScheduleEvent);
router.route("/:id").put(protect, updateScheduleEvent);

router.route("/:id").delete(protect, deleteScheduleEvent);

router.route("/:id/complete").patch(protect, markEventCompleted);


router.route("/admin").get(protect, admin, getAdminSchedule);

router
  .route("/source/:sourceType/:sourceId")
  .delete(protect, admin, deleteEventsBySource);

export default router;