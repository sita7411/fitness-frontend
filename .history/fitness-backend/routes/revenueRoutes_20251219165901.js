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

router.get("/total", protect, adminprotect, getTotalRevenue);
router.get("/performance", protect, adminprotect, getRevenuePerformance);
router.get("/monthly-overview", protect, adminprotect, getMonthlyOverview);
router.get("/membership/summary", protect, adminprotect, getMembershipSummary);
router.get("/membership/distribution", protect, adminprotect, getPlanDistribution);
router.get("/transactions", protect, adminprotect, getTransactions);
router.get("/membership/users", protect, adminprotect, getMembershipUsers);
router.get("/report", protect, adminprotect, getRevenueReport);

router.get("/today", protect, adminprotect, getTodayRevenue);

router.get("/last-7-days", protect, adminprotect, getLast7DaysRevenue);

export default router;