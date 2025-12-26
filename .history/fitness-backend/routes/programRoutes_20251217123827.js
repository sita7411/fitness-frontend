import express from "express";
import {
  createProgram,
  updateProgram,
  getPrograms,
  getProgramById,
  deleteProgram,
  updateProgramStatus,
  getUserPrograms,
  completeProgramDay,
  getWeeklyWorkoutStats,
  getTrendingWorkouts,
} from "../controllers/programController.js";

import { protect } from "../middleware/auth.js";
import { uploadProgramThumbnail } from "../middleware/uploadMiddleware.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// ===================================
// PUBLIC ROUTES (No authentication required)
// ===================================
router.get("/", getPrograms);                    // Get all programs
router.get("/:id", getProgramById);              // Get single program by ID
router.get("/trending", getTrendingWorkouts);    // Get trending programs
router.get("/weekly-stats", getWeeklyWorkoutStats); // Get weekly stats

// ===================================
// AUTHENTICATED USER ROUTES
// ===================================
router.get("/user", protect, getUserPrograms);              // Get logged-in user's enrolled programs
router.post("/:id/complete", protect, completeProgramDay); // Mark a program day as complete

// ===================================
// ADMIN ONLY ROUTES
// ===================================
router.post("/", adminAuth, uploadProgramThumbnail, createProgram);        // Create new program
router.put("/:id", adminAuth, uploadProgramThumbnail, updateProgram);      // Update program
router.delete("/:id", adminAuth, deleteProgram);                           // Delete program
router.patch("/:id/status", adminAuth, updateProgramStatus);               // Update program status (active/inactive)

// Note: getProgramDay controller imported but not used — remove if not needed later
// import { getProgramDay } ... ← can be removed if unused

export default router;