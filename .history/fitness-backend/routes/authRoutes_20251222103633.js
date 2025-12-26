// routes/authRoutes.js
import express from "express";
import { 
  signup, 
  login, 
  logout, 
  me, 
  updateProfile, 
  updatePassword, 
  updatePreferences,
  adminLogin,
  getAllUsers,
  getUserById,
  deleteUser,
  getUserPrograms,
  getUserProgress,
  saveUserProgress
} from "../controllers/authController.js";

import { protectUser, protectAdmin } from "../middleware/auth.js";

import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

/* ========================
   UPLOAD CONFIG
======================== */
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

/* ========================
   PUBLIC ROUTES
======================== */
router.post("/signup", upload.single("avatar"), signup);
router.post("/login", login);                 // User login
router.post("/admin/login", adminLogin);      // Admin login
router.post("/logout", logout);

/* ========================
   USER PROTECTED ROUTES
======================== */
router.get("/user/me", protectUser, me);
router.put("/user/me", protectUser, upload.single("avatar"), updateProfile);
router.put("/password", protectUser, updatePassword);
router.put("/preferences", protectUser, updatePreferences);

router.get("/programs/user", protectUser, getUserPrograms);
router.get("/user/progress", protectUser, getUserProgress);
router.post("/user/progress", protectUser, saveUserProgress);

/* ========================
   ADMIN PROTECTED ROUTES
======================== */
router.get("/admin/me", protectAdmin, me);

router.get("/admin/users", protectAdmin, getAllUsers);
router.get("/admin/users/:id", protectAdmin, getUserById);
router.delete("/admin/users/:id", protectAdmin, deleteUser);

export default router;
