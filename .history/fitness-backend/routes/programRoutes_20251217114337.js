import express from "express";
import {
  createProgram,
  updateProgram,
  getPrograms,
  getProgramById,
  getProgramDay,
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

// PUBLIC ROUTES
router.get("/", getPrograms);
router.get("/trending", getTrendingWorkouts);
router.get("/weekly-stats", getWeeklyWorkoutStats);
router.get("/:id", getProgramById);
router.get("/:id/day/:day", getProgramDay);

// USER ROUTES (Authenticated)
router.get("/user", protect, getUserPrograms);
router.post("/:id/complete", protect, completeProgramDay);

// USER ROUTES (Authenticated) - YE SABSE UPAR LAO!
router.get("/user", protect, getUserPrograms);
router.post("/:id/complete", protect, completeProgramDay);

// ADMIN ROUTES (Authenticated + Admin check)
router.post("/", adminAuth, uploadProgramThumbnail, createProgram);
router.put("/:id", adminAuth, uploadProgramThumbnail, updateProgram);
router.delete("/:id", adminAuth, deleteProgram);
router.patch("/:id/status", adminAuth, updateProgramStatus);

export default router;
