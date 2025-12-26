import express from "express";
import {
  createClass,
  updateClass,
  getAllClasses,
  getClassById,
  deleteClass,
  getClassProgress,
  saveClassProgress,
  listActiveClasses,   
  getUserClasses,     
  toggleStatus,        
} from "../controllers/classController.js";

// routes/programRoutes.js
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
  getUserStreak,
  getUserAchievements,
} from "../controllers/programController.js";

import { protect, adminprotect } from "../middleware/auth.js";
import { uploadProgramThumbnail } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ====================== PUBLIC ROUTES ======================
router.get("/", getPrograms);
router.get("/trending", getTrendingWorkouts);
router.get("/weekly-stats", getWeeklyWorkoutStats);

// ====================== AUTHENTICATED USER ROUTES ======================
router.get("/user", protect, getUserPrograms);
router.get('/achievements', protect, getUserAchievements);

router.get("/:id", getProgramById);
router.get("/:id/day/:day", getProgramDay);

router.get("/:id/progress", protect, getUserProgressForProgram);
router.get("/:id/streak", protect, getUserStreak);
router.post("/:id/complete-exercise", protect, completeExercise);
router.post("/:id/complete-day", protect, completeProgramDay);     
router.post("/:id/reset-day", protect, resetProgramDay);
router.post("/:id/reset-program", protect, resetFullProgram);

// ====================== ADMIN ROUTES ======================
router.post("/", adminprotect, uploadProgramThumbnail, createProgram);
router.put("/:id", adminprotect, uploadProgramThumbnail, updateProgram);
router.delete("/:id", adminprotect, deleteProgram);
router.patch("/:id/status", adminprotect, updateProgramStatus);

export default router;import { adminAuth } from "../middleware/adminAuth.js";
import { uploadClassFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ========================
// ADMIN ROUTES (Protected + Admin)
// ========================
router.route("/")
  .post( adminAuth, uploadClassFiles, createClass)         
  .get( adminAuth, getAllClasses);      

router.get("/active", listActiveClasses);
router.get("/user", protect, getUserClasses);   
router.get("/:classId/progress", protect, getClassProgress);
router.post("/progress", protect, saveClassProgress);

router.route("/:id")
  .get( adminAuth, getClassById)          
  .put( adminAuth, uploadClassFiles, updateClass)           
  .delete(adminAuth, deleteClass);      

router.patch("/:id/status", adminAuth, toggleStatus);


export default router;