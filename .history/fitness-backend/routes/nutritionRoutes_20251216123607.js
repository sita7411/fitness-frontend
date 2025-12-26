// routes/nutritionRoutes.js
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

const router = express.Router();

// ======================== PUBLIC ROUTES ========================

router.get("/", getPlans);

router.get("/:id", getPlanById);

router.get("/my/plans", protect, getUserNutritionPlans);

// ======================== ADMIN ROUTES ========================

// Create new nutrition plan
// Accepts: 'data' (JSON string), 'coverImage' (file), and any 'meal-xxx' (meal thumbnail files)
router.post("/", protect, uploadNutritionFiles, createPlan);

// Update existing plan
router.put("/:id", protect, uploadNutritionFiles, updatePlan);

// Update status only (Active / Inactive)
router.patch("/:id/status", protect, updatePlanStatus);

// Delete plan
router.delete("/:id", protect, deletePlan);

export default router;