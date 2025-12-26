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

router.get("/", getMemberships);

router.get("/:id", getMembershipById);

router.get("/user/:userId/programs", getUserAvailablePrograms);

// ==================== ADMIN ROUTES (PROTECTED) ====================

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