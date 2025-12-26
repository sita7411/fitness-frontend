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

const router = express.Router();

// ========================
// ADMIN ROUTES (Protected + Admin)
// ========================
router.route("/")
  .post( adminAuth, createClass)          // Admin: Create class
  .get( adminAuth, getAllClasses);        // Admin: All classes (admin panel)

router.route("/:id")
  .get( adminAuth, getClassById)          // Admin: Get single for edit
  .put( adminAuth, updateClass)           // Admin: Update
  .delete(protect,adminAuth, deleteClass);       // Admin: Delete

// Optional: Status toggle (Active ↔ Inactive)
router.patch("/:id/status", protect, adminAuth, toggleStatus);

// ========================
// PUBLIC & USER ROUTES
// ========================

router.get("/active", listActiveClasses);

router.get("/user", protect, getUserClasses);

export default router;