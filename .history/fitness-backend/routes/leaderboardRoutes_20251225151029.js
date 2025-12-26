// routes/leaderboard.routes.js

import express from "express";
import { 
  getLeaderboard,           // existing: last 14 days leaderboard
  getMonthlyTopPerformer    // NEW: current month ka top performer
} from "../controllers/leaderboardController.js"; 
import { protect } from "../middleware/auth.js"; 
import { adminProtect } from "../middleware/auth.js"; // agar alag admin middleware hai, warna protect hi use karo

const router = express.Router();

// Existing: Full leaderboard (last 14 days) - accessible to logged-in users or admin
router.route("/").get(protect, getLeaderboard);

// NEW: Monthly top performer - only for admin dashboard
router.route("/monthly-top").get(protect, getMonthlyTopPerformer); 


export default router;