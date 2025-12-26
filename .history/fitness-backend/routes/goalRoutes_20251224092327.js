// routes/goalRoutes.js
import express from "express";
import {
  getCurrentGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  getGoalStats,
} from "../controllers/goalController.js";
import {  adminprotect } from "../middleware/auth.js";

const router = express.Router();
router.get("/stats", getGoalStats);
// All routes protected
router.get("/current", adminprotect, getCurrentGoals);
router.post("/add", adminprotect, addGoal);
router.put("/update/:goalId", adminprotect, updateGoal);
router.delete("/delete/:goalId", adminprotect, deleteGoal);

export default router;