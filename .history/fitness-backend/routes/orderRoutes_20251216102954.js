// routes/orderRoutes.js
import express from "express";
import { createOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js"; // assuming you have auth

const router = express.Router();

router.post("/create", protect, createOrder); // protected route

export default router;