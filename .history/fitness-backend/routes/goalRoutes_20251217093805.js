// routes/goalRoutes.js
import express from "express";
import {
  getCurrentGoals,
  setMonthlyTargets,
} from "../controllers/goalController.js";
import { adminProtect } from "../middleware/adminProtect.js";

const router = express.Router();

router.get("/current", adminProtect, getCurrentGoals);

router.post("/set", adminProtect, setMonthlyTargets);

export default router;