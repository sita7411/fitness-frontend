import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";  // ← Yeh use ho raha hai ab
import connectDB from "./config/db.js";
import bcrypt from "bcryptjs";

// All Routes
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import classesRoutes from "./routes/classesRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

// CORS for HTTP requests
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => res.send("API Running – Ready!"));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// ================= SOCKET.IO SETUP =================
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Global io for use in services/controllers
global.io = io;

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Yeh event frontend se aayega login ke baad
  socket.on("register", ({ role, id }) => {
    if (!role || !id) return;

    const room = `${role}_${id}`;
    socket.join(room);
    console.log(`${role} ${id} joined room → ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});
// ================================================

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected");

    // Default Admin
    const adminEmail = "admin@gmail.com";
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash("Admin@123", 12);
      await Admin.create({
        name: "Super Admin",
        email: adminEmail,
        password: hashed
      });
      console.log("Default Admin Created → admin@gmail.com / Admin@123");
    }

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Socket.IO is fully active and ready for real-time notifications 🚀`);
    });

  } catch (err) {
    console.error("Server failed:", err);
    process.exit(1);
  }
};

startServer();