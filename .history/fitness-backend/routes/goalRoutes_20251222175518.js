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
router.get("/stats", adminprotect, getGoalStats);
// All routes protected
router.get("/current", adminprotect("admin"), getCurrentGoals);
router.post("/add",  adminprotect("admin"), addGoal);
router.put("/update/:goalId",  adminprotect("admin"), updateGoal);
router.delete("/delete/:goalId", adminprotect("admin"), deleteGoal);

export default router;