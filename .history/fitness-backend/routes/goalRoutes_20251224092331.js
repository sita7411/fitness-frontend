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
router.get("/current", getCurrentGoals);
router.post("/add", addGoal);
router.put("/update/:goalId", updateGoal);
router.delete("/delete/:goalId", adminprotect, deleteGoal);

export default router;