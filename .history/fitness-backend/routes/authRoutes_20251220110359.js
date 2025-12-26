// routes/authRoutes.js - FINAL UNIFIED VERSION (December 2025)
import express from "express";
import { 
  signup, 
  login, 
  logout, 
  me, 
  updateProfile, 
  updatePassword, 
  updatePreferences,
  adminLogin,                  // ← NAYA ADD (admin ke liye alag login)
  getAllUsers,
  getUserById,
  deleteUser,
  getUserPrograms,
  getUserProgress,
  saveUserProgress
} from "../controllers/authController.js";

import { protect, adminprotect } from "../middleware/auth.js";  // ← Updated middleware

import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// Upload middleware for avatar (Cloudinary direct)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_photos",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
});
const upload = multer({ storage });

// ========================
// PUBLIC ROUTES
// ========================
router.post("/signup", upload.single("avatar"), signup);
router.post("/login", login);                    // Normal user login
router.post("/admin/login", adminLogin);         // ← Admin login (alag endpoint)
router.post("/logout", logout);

// ========================
// PROTECTED ROUTES (User + Admin)
// ========================
router.get("/me", protect, me);
router.put("/me", protect, upload.single("avatar"), updateProfile);
router.put("/password", protect, updatePassword);
router.put("/preferences", protect, updatePreferences);

router.get("/programs/user", protect, getUserPrograms);
router.get("/user/progress", protect, getUserProgress);
router.post("/user/progress", protect, saveUserProgress);

// ========================
// ADMIN ONLY ROUTES
// ========================
router.get("/admin/users", protect, adminprotect("admin"), getAllUsers);
router.get("/admin/users/:id", protect, adminprotect("admin"), getUserById);
router.delete("/admin/users/:id", protect, adminprotect("admin"), deleteUser);
router.get("/admin/me", protect, adminprotect("admin"), me);
router.post("/admin/logout", protect, adminprotect("admin"), logout);  // ← NEW: Add this line after /logout route
export default router;