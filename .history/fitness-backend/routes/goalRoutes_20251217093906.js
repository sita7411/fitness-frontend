// routes/goalRoutes.js
import express from "express";
import {
  getCurrentGoals,
  addGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/goalController.js";
import { adminProtect } from "../middleware/adminProtect.js";

const router = express.Router();

// All routes protected
router.get("/current", adminProtect, getCurrentGoals);
router.post("/add", adminProtect, addGoal);
router.put("/update/:goalId", adminProtect, updateGoal);
router.delete("/delete/:goalId", adminProtect, deleteGoal);

export default router;