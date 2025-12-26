// routes/revenueRoutes.js
import express from "express";
import {
  getTotalRevenue,
  getRevenuePerformance,
  getMonthlyOverview,
  getMembershipSummary,
  getPlanDistribution,
  getTransactions,
  getMembershipUsers,
  getRevenueReport,
  getTodayRevenue,
  getLast7DaysRevenue,
} from "../controllers/revenueController.js";

import { protect } from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// ====================== ADMIN ONLY ROUTES ======================

router.get("/total", protect, adminProtect, getTotalRevenue);
router.get("/performance", protect, adminProtect, getRevenuePerformance);
router.get("/monthly-overview", protect, adminProtect, getMonthlyOverview);
router.get("/membership/summary", protect, adminProtect, getMembershipSummary);
router.get("/membership/distribution", protect, adminProtect, getPlanDistribution);
router.get("/transactions", protect, adminProtect, getTransactions);
router.get("/membership/users", protect, adminProtect, getMembershipUsers);
router.get("/report", protect, adminProtect, getRevenueReport);

router.get("/today", protect, adminProtect, getTodayRevenue);

router.get("/last-7-days", protect, adminProtect, getLast7DaysRevenue);

export default router;