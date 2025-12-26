import express from "express";
import {
  createChallenge,
  updateChallenge,
  getChallenges,
  getChallengeById,
  deleteChallenge,
  getUserChallenges,
  completeChallenge,
} from "../controllers/challengeController.js";

import { protect, admin } from "../middleware/aut.js"; 
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.get("/", getChallenges);
router.get("/user", protect, getUserChallenges);
router.get("/:id", getChallengeById);

// Protected / Admin routes
router.post("/create", protect, admin, createChallenge);
router.put("/:id", protect, admin, updateChallenge);
router.delete("/:id", protect, admin, deleteChallenge);
router.patch("/:id/complete", protect, completeChallenge); // or POST if preferred

export default router;