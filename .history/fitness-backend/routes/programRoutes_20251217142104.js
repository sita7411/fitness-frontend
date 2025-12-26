import express from "express";
import {
  createProgram,
  updateProgram,
  getPrograms,
  getUserProgressForProgram,
  completeExercise,
  getProgramById,
  getProgramDay,
  deleteProgram,
  updateProgramStatus,
  getUserPrograms,
  completeProgramDay,
  getWeeklyWorkoutStats,
  getTrendingWorkouts,
    resetProgramDay,
  resetFullProgram,
} from "../controllers/programController.js";
import { protect } from "../middleware/auth.js";
import { uploadProgramThumbnail } from "../middleware/uploadMiddleware.js";
import { adminAuth } from "../middleware/adminAuth.js";
const router = express.Router();

// PUBLIC ROUTES
router.get("/", getPrograms);
router.get("/trending", getTrendingWorkouts);
router.get("/weekly-stats", getWeeklyWorkoutStats);

router.get("/user", protect, getUserPrograms);
router.get("/:id/progress", protect, getUserProgressForProgram);

router.post("/:id/complete-exercise", protect, completeExercise);
router.post("/:id/complete", protect, completeProgramDay);

router.get("/:id", getProgramById);
router.get("/:id/day/:day", getProgramDay);

// USER ROUTES (Authenticated)
router.get("/user", protect, getUserPrograms);
router.post("/:id/complete", protect, completeProgramDay);

// ADMIN ROUTES (Authenticated + Admin check)
router.post("/", adminAuth, uploadProgramThumbnail, createProgram);
router.put("/:id", adminAuth, uploadProgramThumbnail, updateProgram);
router.delete("/:id", adminAuth, deleteProgram);
router.patch("/:id/status", adminAuth, updateProgramStatus);

export default router;
