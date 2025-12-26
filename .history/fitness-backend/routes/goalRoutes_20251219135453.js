// routes/goalRoutes.js
import express from "express";
import {
  getCurrentGoals,
  addGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/goalController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();
router.get("/current", protect, getCurrentGoals);
router.get("/stats", protect, getGoalStats);
// All routes protected
router.get("/current", adminAuth, getCurrentGoals);
router.post("/add", adminAuth, addGoal);
router.put("/update/:goalId", adminAuth, updateGoal);
router.delete("/delete/:goalId", adminAuth, deleteGoal);

export default router;