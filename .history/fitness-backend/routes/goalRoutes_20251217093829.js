// routes/goalRoutes.js
import express from "express";
import {
  getCurrentGoals,
  setMonthlyTargets,
} from "../controllers/goalController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/current", adminAuth, getCurrentGoals);

router.post("/set", adminAuth, setMonthlyTargets);

export default router;