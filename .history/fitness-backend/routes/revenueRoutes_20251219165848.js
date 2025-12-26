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

import { protect, adminprotect } from "../middleware/auth.js";

const router = express.Router();

// ====================== ADMIN ONLY ROUTES ======================

router.get("/total", protect, adminAuth, getTotalRevenue);
router.get("/performance", protect, adminAuth, getRevenuePerformance);
router.get("/monthly-overview", protect, adminAuth, getMonthlyOverview);
router.get("/membership/summary", protect, adminAuth, getMembershipSummary);
router.get("/membership/distribution", protect, adminAuth, getPlanDistribution);
router.get("/transactions", protect, adminAuth, getTransactions);
router.get("/membership/users", protect, adminAuth, getMembershipUsers);
router.get("/report", protect, adminAuth, getRevenueReport);

router.get("/today", protect, adminAuth, getTodayRevenue);

router.get("/last-7-days", protect, adminAuth, getLast7DaysRevenue);

export default router;