// routes/leaderboard.routes.js

import express from "express";
import { getLeaderboard } from "../controllers/leaderboardController.js"; // ← apne controller ka correct path daalna
import { protect, admin } from "../middleware/authMiddleware.js"; // agar auth lagega to, warna remove kar dena

const router = express.Router();

// Public leaderboard (members ke liye) - auth optional ya required, jaise tumhare app mein hai
router.route("/").get(/* protect, */ getLeaderboard);


export default router;