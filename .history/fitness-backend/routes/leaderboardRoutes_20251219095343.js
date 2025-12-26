// routes/leaderboard.routes.js

import express from "express";
import { getLeaderboard } from "../controllers/leaderboardController.js"; // ← apne controller ka correct path daalna
import { protec } from "../middleware/auth.js"; // agar auth lagega to, warna remove kar dena

const router = express.Router();

router.route("/").get( protect,  getLeaderboard);


export default router;