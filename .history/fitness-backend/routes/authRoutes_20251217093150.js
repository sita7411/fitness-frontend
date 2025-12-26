import express from "express";
import {
  signup,
  login,
  logout,
  me,
  getUserPrograms,
  getUserProgress,
  saveUserProgress,
  updateProfile,
  updatePassword,
  updatePreferences,
  getAllUsers,
  gdeleteUseretUserById,

} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", protect, me);
router.get("/programs", protect, getUserPrograms);
router.get("/progress", protect, getUserProgress);
router.post("/progress", protect, saveUserProgress);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.put("/preferences", protect, updatePreferences);


router.get("/programs/user", protect, getUserPrograms);
router.get("/user/progress", protect, getUserProgress);
router.post("/user/progress", protect, saveUserProgress);

// ADMIN ROUTES
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);
router.delete("/:id", protect, deleteUser);

export default router;
