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

// ==================================================================
// ADMIN ONLY ROUTES
// ==================================================================

// GET /api/schedule/admin?month=2025-12&userId=all (ya specific userId)
// → Admin ko sab users ya specific user ka schedule dikhata hai
router.route("/admin").get(protect, admin, getAdminSchedule);

// DELETE /api/schedule/source/:sourceType/:sourceId
// → Jab koi Program, Challenge ya Class delete ho, toh uske saare scheduled events delete
// Example: /api/schedule/source/program/8week-fatloss
//          /api/schedule/source/challenge/669f8b2d1e4b2c1a5d8e9f0a
router
  .route("/source/:sourceType/:sourceId")
  .delete(protect, admin, deleteEventsBySource);

export default router;