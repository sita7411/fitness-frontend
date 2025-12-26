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

// ========================
// ADMIN ROUTES (Protected + Admin)
// ========================
router.route("/")
  .post( adminprotect, uploadClassFiles, createClass)         
  .get( adminprotect, getAllClasses);      

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