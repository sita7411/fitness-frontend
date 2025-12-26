// routes/goalRoutes.js
import express from "express";
import {
  getCurrentGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  getGoalStats,
} from "../controllers/goalController.js";

const router = express.Router();
router.get("/stats",  protect, adminprotect("admin"),getGoalStats);
// All routes protected
router.get("/current", protect, adminprotect("admin"), getCurrentGoals);
router.post("/add", protect, adminprotect("admin"), addGoal);
router.put("/update/:goalId", updateGoal);
router.delete("/delete/:goalId", deleteGoal);

export default router;