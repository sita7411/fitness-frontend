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
  .get( getAllClasses);

router.route("/:id")
  .get(, getClassById)
  .put(adminprotect, uploadClassFiles, updateClass)
  .delete(adminprotect, deleteClass);

router.patch("/:id/status", adminprotect, toggleStatus);

router.get("/active", listActiveClasses);                  

router.get("/user", protect, getUserClasses);
router.get("/:classId/progress", protect, getClassProgress);
router.post("/progress", protect, saveClassProgress);

export default router;