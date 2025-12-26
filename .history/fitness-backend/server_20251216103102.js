import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import connectDB from "./config/db.js";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

// Routes (sab important routes add kar diye)
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import classesRoutes from "./routes/classesRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

// ← YE NAYE ADD KIYE GAYE HAIN (tumhare checkout + OTP flow ke liye zaruri)
import otpRoutes from "./routes/otpRoutes.js";           // OTP send & verify
import orderRoutes from "./routes/orderRoutes.js";         // Direct order create (logged-in users)
import membershipRoutes from "./routes/membershipRoutes.js"; // agar membership use kar rahe ho
import challengeRoutes from "./routes/challengeRoutes.js";   // challenges ke liye (optional but safe)
import nutritionRoutes from "./routes/nutritionRoutes.js";   // nutrition plans ke liye (optional)

dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());

// Routes (sab mount kar diye)
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/cart", cartRoutes);

// ← NAYE ROUTES ADD
app.use("/api/otp", otpRoutes);               // POST /api/otp/send & /api/otp/verify
app.use("/api/orders", orderRoutes);          // POST /api/orders/create (protected)
app.use("/api/memberships", membershipRoutes); // agar membership purchase kar rahe ho
app.use("/api/challenges", challengeRoutes);   // optional
app.use("/api/nutrition", // optionalnutritionRoutes);    

app.get("/", (req, res) => res.send("API Running – Ready!"));

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected");

    // Create default admin if not exists
    const adminEmail = "admin@gmail.com";
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash("Admin@123", 12);
      await Admin.create({ 
        name: "Super Admin", 
        email: adminEmail, 
        password: hashed 
      });
      console.log("Admin created → admin@gmail.com / Admin@123");
    }

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Socket.IO is active and ready for connections`);
    });

  } catch (err) {
    console.error("Server failed:", err);
    process.exit(1);
  }
};

startServer();