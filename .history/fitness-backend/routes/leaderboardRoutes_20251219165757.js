// routes/leaderboard.routes.js

import express from "express";
import { getLeaderboard } from "../controllers/leaderboardController.js"; 

const router = express.Router();

router.route("/").get( protect,  getLeaderboard);


export default router;