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

// Optional: Agar admin routes ko protect karna hai to uncomment kar dena
// import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get all memberships (frontend MembershipPage ke liye)
router.get("/", getMemberships);

// Get single membership by ID (agar detail page banana ho future mein)
router.get("/:id", getMembershipById);

// Get available programs for a user based on their membership (optional advanced feature)
router.get("/user/:userId/programs", getUserAvailablePrograms);

// ==================== ADMIN ROUTES (PROTECTED) ====================

// Create new membership
router.post("/", 
  // protect, admin,      // ← Uncomment jab auth middleware ready ho
  createMembership
);

// Update existing membership
router.put("/:id", 
  // protect, admin,      // ← Uncomment for protection
  updateMembership
);

// Delete membership (with safety check)
router.delete("/:id", 
  // protect, admin,      // ← Uncomment for protection
  deleteMembership
);

router.post("/assign", 
  assignMembershipToUser
);

export default router;