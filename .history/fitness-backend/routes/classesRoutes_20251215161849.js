// routes/classes.js
import express from "express";
import {
  createClass,
  updateClass,
  getAllClasses,
  getClassById,
  deleteClass,
  listActiveClasses,   // Public: shop page के लिए
  getUserClasses,      // Logged-in user के classes
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
  .get( adminAuth, getAllClasses);       el)

router.route("/:id")
  .get( adminAuth, getClassById)          
  .put( adminAuth, uploadClassFiles, updateClass)           
  .delete(adminAuth, deleteClass);       // Admin: Delete

// Optional: Status toggle (Active ↔ Inactive)
router.patch("/:id/status", adminAuth, toggleStatus);

// ========================
// PUBLIC & USER ROUTES
// ========================

router.get("/active", listActiveClasses);

router.get("/user", protect, getUserClasses);

export default router;