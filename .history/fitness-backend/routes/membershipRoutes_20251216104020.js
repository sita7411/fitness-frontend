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