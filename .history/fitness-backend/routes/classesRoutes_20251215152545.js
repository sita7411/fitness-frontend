// routes/classes.js
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

const router = express.Router();

// ========================
// ADMIN ROUTES (Protected + Admin)
// ========================
router.route("/")
  .post(protect, adminAuth, createClass)          // Admin: Create class
  .get(protect, adminAuth, getAllClasses);        // Admin: All classes (admin panel)

router.route("/:id")
  .get(protect, adminAuth, getClassById)          // Admin: Get single for edit
  .put(protect, adminAuth, updateClass)           // Admin: Update
  .delete(protect,adminAuth, deleteClass);       // Admin: Delete

// Optional: Status toggle (Active ↔ Inactive)
router.patch("/:id/status", protect, adminAuth, toggleStatus);

// ========================
// PUBLIC & USER ROUTES
// ========================

// Public: सभी Active classes (Shop page - Classes.jsx)
router.get("/active", listActiveClasses);

// Protected: Logged-in user को उसके purchased/assigned/membership classes
router.get("/user", protect, getUserClasses);

export default router;