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

// YE UPAR LAO - :id SE PEHLE!
router.get("/my/plans", protect, getUserNutritionPlans);   

// AB :id NEECHE
router.get("/:id", getPlanById);

// ======================== ADMIN ROUTES ========================

router.post("/", protect, uploadNutritionFiles, createPlan);

router.put("/:id", protect, uploadNutritionFiles, updatePlan);

router.patch("/:id/status", protect, updatePlanStatus);

// Delete plan
router.delete("/:id", protect, deletePlan);

export default router;