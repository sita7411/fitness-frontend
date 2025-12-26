// routes/otpRoutes.js
import express from "express";
import { sendOtp, verifyOtpAndSaveOrder } from "../controllers/otpController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/send", sendOtp);
router.post("/verify", verifyOtpAndSaveOrder);

export default router;