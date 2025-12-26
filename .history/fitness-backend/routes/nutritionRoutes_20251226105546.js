import express from "express";
import multer from "multer";
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  updatePlanStatus,
  getUserNutritionPlans,
} from "../controllers/nutritionPlanController.js"; 
import { protect } from "../middleware/auth.js"; 
import { uploadNutritionFiles } from "../middleware/uploadMiddleware.js";
import User from "../models/User.js";                 
import mongoose from "mongoose";                    
const router = express.Router();

// ======================== PUBLIC ROUTES ========================

router.get("/", getPlans);

router.get("/my/plans", protect, getUserNutritionPlans);   

router.get("/:id", getPlanById);

// ======================== ADMIN ROUTES ========================

router.post("/", protect, uploadNutritionFiles, createPlan);

router.put("/:id", protect, uploadNutritionFiles, updatePlan);

router.patch("/:id/status", protect, updatePlanStatus);

// Delete plan
router.delete("/:id", protect, deletePlan);

export default router;