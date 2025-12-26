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

// PUT /api/schedule/:id
// → Event update (sirf owner ya admin)
router.route("/:id").put(protect, updateScheduleEvent);

// DELETE /api/schedule/:id
// → Event delete (sirf owner ya admin)
router.route("/:id").delete(protect, deleteScheduleEvent);

// PATCH /api/schedule/:id/complete
// → Event ko completed mark karna (owner ya admin)
router.route("/:id/complete").patch(protect, markEventCompleted);


router.route("/admin").get(protect, admin, getAdminSchedule);

router
  .route("/source/:sourceType/:sourceId")
  .delete(protect, admin, deleteEventsBySource);

export default router;