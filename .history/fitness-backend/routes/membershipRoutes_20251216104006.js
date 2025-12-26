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


router.post("/", 
  createMembership
);

router.put("/:id", 
  updateMembership
);

router.delete("/:id", 
  deleteMembership
);

router.post("/assign", 
  assignMembershipToUser
);

export default router;