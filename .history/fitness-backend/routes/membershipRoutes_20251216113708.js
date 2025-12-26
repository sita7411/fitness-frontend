// routes/membershipRoutes.js
import express from "express";
import {
  createMembership,
  getMemberships,
  getMembershipById,
  updateMembership,
  deleteMembership,
  assignMembershipToUser,
  getUserAvailablePrograms,
} from "../controllers/membershipController.js";

import { protect, admin } from "../middleware/auth.js"; // ← YE IMPORT ZAROORI HAI

const router = express.Router();

// ==================== PUBLIC ROUTES (No Login Required) ====================
router.get("/", getMemberships);                    // Sabko dikhe memberships
router.get("/:id", getMembershipById);              // Single plan detail
router.get("/user/:userId/programs", protect, getUserAvailablePrograms); // User ke available programs (login chahiye)

// ==================== ADMIN ONLY ROUTES (Login + Admin Required) ====================
router.post("/", protect, admin, createMembership);           // Naya membership banao
router.put("/:id", protect, admin, updateMembership);         // Edit membership
router.delete("/:id", protect, admin, deleteMembership);      // Delete membership

router.post("/assign", protect, admin, assignMembershipToUser);

export default router;