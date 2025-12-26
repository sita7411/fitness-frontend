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

import { protect, adminprotect } from "../middleware/auth.js";
import { uploadClassFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ADMIN ROUTES
router.route("/")
  .post(adminprotect, uploadClassFiles, createClass)
  .get(adminprotect, getAllClasses);

router.route("/:id")
  .get(adminprotect, getClassById)
  .put(adminprotect, uploadClassFiles, updateClass)
  .delete(adminprotect, deleteClass);

router.patch("/:id/status", adminprotect, toggleStatus);

// PUBLIC ROUTES (कोई login की जरूरत नहीं)
router.get("/active", listActiveClasses);                  // ← यहाँ protect हटाया

// USER-SPECIFIC ROUTES (login जरूरी)
router.get("/user", protect, getUserClasses);
router.get("/:classId/progress", protect, getClassProgress);
router.post("/progress", protect, saveClassProgress);

export default router;