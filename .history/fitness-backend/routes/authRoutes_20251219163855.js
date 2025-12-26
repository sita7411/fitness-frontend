// routes/authRoutes.js → Ab yeh User + Admin dono handle karegi
import express from "express";
import {
  signup,
  login,           // User login
  adminLogin,      // Admin login
  logout,
  me,
  updateProfile,
  updatePassword,
  updatePreferences,
  getAllUsers,
  getUserById,
  deleteUser,
  getUserPrograms,
  getUserProgress,
  saveUserProgress,
  // agar admin ke alag controllers the toh unko bhi import kar lo
} from "../controllers/authController.js";

import { protect, adminOnly } from "../middleware/auth.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Cloudinary upload
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_photos",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  },
});
const upload = multer({ storage });

// PUBLIC ROUTES
router.post("/signup", upload.single("avatar"), signup);
router.post("/login", login);                    // ← Normal user login
router.post("/admin/login", adminLogin);         // ← Admin login (alag endpoint)
router.post("/logout", logout);

// PROTECTED (User + Admin dono)
router.get("/me", protect, me);
router.put("/me", protect, upload.single("avatar"), updateProfile);
router.put("/password", protect, updatePassword);
router.put("/preferences", protect, updatePreferences);

// User specific
router.get("/programs/user", protect, getUserPrograms);
router.get("/user/progress", protect, getUserProgress);
router.post("/user/progress", protect, saveUserProgress);

// ADMIN ONLY ROUTES
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getUserById);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;