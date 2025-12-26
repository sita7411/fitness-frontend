// routes/otpRoutes.js
import express from "express";
import { sendOtp, verifyOtpAndSaveOrder } from "../controllers/otpController.js";

const router = express.Router();

router.post("/send", sendOtp);
router.post("/verify", verifyOtpAndSaveOrder);

export default router;