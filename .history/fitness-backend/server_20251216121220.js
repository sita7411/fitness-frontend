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
import membershipRoutes from "./routes/membershipRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";           
import orderRoutes from "./routes/orderRoutes.js";         
import challengeRoutes from "./routes/challengeRoutes.js";

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

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/cart", cartRoutes);

app.use("/api/otp", otpRoutes);               
app.use("/api/orders", orderRoutes);         
app.use("/api/memberships", membershipRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/nutrition", nutritionRoutes); 
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