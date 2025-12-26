import express from "express";
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  updatePlanStatus,
  getUserNutritionPlans,
  markMealComplete,
} from "../controllers/nutritionPlanController.js";

import { protect } from "../middleware/auth.js";
import { uploadNutritionFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ======================== PUBLIC ROUTES ========================
router.get("/", getPlans);

// ✅ Specific routes FIRST (yeh pehle match honge)
router.post("/mark-meal-complete", protect, markMealComplete);

// ======================== PROTECTED USER ROUTES ========================
router.get("/my/plans", protect, getUserNutritionPlans);

// ======================== ADMIN ROUTES ========================
router.post("/", protect, uploadNutritionFiles, createPlan);
router.put("/:id", protect, uploadNutritionFiles, updatePlan);
router.patch("/:id/status", protect, updatePlanStatus);
router.delete("/:id", protect, deletePlan);

// ✅ Dynamic route LAST (sabse neeche)
router.get("/:id", getPlanById);

export default router;