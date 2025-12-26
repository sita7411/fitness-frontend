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

// All routes protected
router.get("/current", adminAuth, getCurrentGoals);
router.post("/add", adminAuth, addGoal);
router.put("/update/:goalId", adminProtect, updateGoal);
router.delete("/delete/:goalId", adminProtect, deleteGoal);

export default router;