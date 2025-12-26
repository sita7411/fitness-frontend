import express from "express";
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  updatePlanStatus,
  getUserNutritionPlans,
  markMealComplete,               // ← YE ADD KARO
} from "../controllers/nutritionPlanController.js"; 

import { protect } from "../middleware/auth.js"; 
import { uploadNutritionFiles } from "../middleware/uploadMiddleware.js";

import User from "../models/User.js";                 
import mongoose from "mongoose";                    

const router = express.Router();

// ======================== PUBLIC ROUTES ========================
router.get("/", getPlans);
router.get("/:id", getPlanById);

// ======================== PROTECTED USER ROUTES ========================
router.get("/my/plans", protect, getUserNutritionPlans);

// ← NAYA ROUTE: Meal permanently complete mark karne ke liye
router.post("/mark-meal-complete", protect, markMealComplete);

// ======================== ADMIN ROUTES ========================
router.post("/", protect, uploadNutritionFiles, createPlan);
router.put("/:id", protect, uploadNutritionFiles, updatePlan);
router.patch("/:id/status", protect, updatePlanStatus);
router.delete("/:id", protect, deletePlan);

export default router;