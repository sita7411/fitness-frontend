// routes/adminRoutes.js
import express from "express";
import {
  adminLogin,
  me,
  logout,
  getAllUsers,
  getUserById,
  deleteUser,
} from "../controllers/authController.js";

import { protect, adminProtect } from "../middleware/auth.js";

const router = express.Router();

// ========================
// PUBLIC ADMIN ROUTE
// ========================
router.post("/login", adminLogin);

// ========================
// PROTECTED ADMIN ROUTES
// ========================
router.use(protect, adminProtect("admin"));

router.get("/me", me);
router.post("/logout", logout);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.delete("/users/:id", deleteUser);

export default router;
