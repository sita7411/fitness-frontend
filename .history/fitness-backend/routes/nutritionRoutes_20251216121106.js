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
} from "../controllers/nutritionController.js"; // Adjust path as needed
import { protect } from "../middleware/authMiddleware.js"; // Your auth middleware (JWT)

// Multer configuration - store files temporarily before uploading to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".").pop());
  },
});

const upload = multer({ storage });

// Important: Use .any() to accept both known (coverImage) and dynamic (meal-*) files
// OR use .fields() if you want stricter control
const multiUpload = upload.any(); // Accepts ALL files sent in FormData

const router = express.Router();

// ======================== PUBLIC ROUTES ========================

// Get all nutrition plans (for listing in admin + user access logic in controller)
router.get("/", getPlans);

// Get single plan by ID (public if needed, or protect later)
router.get("/:id", getPlanById);

// Get plans accessible to the logged-in user (purchased + assigned + membership)
router.get("/my/plans", protect, getUserNutritionPlans);

// ======================== ADMIN ROUTES ========================

// Create new nutrition plan
// Accepts: 'data' (JSON string), 'coverImage' (file), and any 'meal-xxx' (meal thumbnail files)
router.post("/", protect, multiUpload, createPlan);

// Update existing plan
router.put("/:id", protect, multiUpload, updatePlan);

// Update status only (Active / Inactive)
router.patch("/:id/status", protect, updatePlanStatus);

// Delete plan
router.delete("/:id", protect, deletePlan);

export default router;