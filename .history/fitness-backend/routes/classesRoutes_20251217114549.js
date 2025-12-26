import express from "express";
import {
  createClass,
  updateClass,
  getAllClasses,
  getClassById,
  deleteClass,
  listActiveClasses,   
  getUserClasses,     
  toggleStatus,        
} from "../controllers/classController.js";

import { protect } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";
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

router.route("/:id")
  .get( adminAuth, getClassById)          
  .put( adminAuth, uploadClassFiles, updateClass)           
  .delete(adminAuth, deleteClass);      

router.patch("/:id/status", adminAuth, toggleStatus);

export default router;