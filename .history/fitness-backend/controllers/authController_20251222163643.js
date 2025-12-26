// controllers/authController.js → FULLY FIXED & PERFECT VERSION (December 22, 2025)

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";

// ========================
// COOKIE OPTIONS
// ========================

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const sharedCookieOptions = {
  ...baseCookieOptions,
  path: "/",
};

const userCookieOptions = sharedCookieOptions;
const adminCookieOptions = sharedCookieOptions;

const clearUserCookie = {
  ...sharedCookieOptions,
  expires: new Date(0),
  maxAge: 0,
};

const clearAdminCookie = {
  ...sharedCookieOptions,
  expires: new Date(0),
  maxAge: 0,
};

// ---------------- Signup ----------------
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dob } = req.body;

    if (!name || !email || !password || !phone || !gender || !dob) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      gender,
      dob: new Date(dob),
      avatar: req.file?.path || "",
    });

    const token = jwt.sign(
      { id: newUser._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.setHeader("Set-Cookie", [
      cookie.serialize("user_token", token, userCookieOptions),
    ]);

    return res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: "user",
        avatar: newUser.avatar || null,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- User Login ----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.setHeader("Set-Cookie", [
      cookie.serialize("user_token", token, userCookieOptions),
    ]);

    const joined = user.joined
      ? new Date(user.joined).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
      : "Jan 2024";

    res.json({
      loggedIn: true,
      message: "Login successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        avatar: user.avatar || "",
        joined,
        membership: user.membership || { plan: "Free", isActive: false },
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Admin Login ----------------
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const admin = await User.findOne({
      email: email.toLowerCase(),
      role: "admin",
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    await User.findByIdAndUpdate(admin._id, { lastActive: new Date() });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.setHeader("Set-Cookie", [
      cookie.serialize("admin_token", token, adminCookieOptions),
    ]);

    const joined = admin.joined
      ? new Date(admin.joined).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
      : "Jan 2024";

    res.json({
      loggedIn: true,
      message: "Admin login successful",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar || "",
        joined,
      },
    });
  } catch (err) {
    console.error("Admin Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Unified Logout (User + Admin) ----------------
export const logout = async (req, res) => {
  try {
    // दोनों cookies clear करो — safe & clean
    res.setHeader("Set-Cookie", [
      cookie.serialize("user_token", "", clearUserCookie),
      cookie.serialize("admin_token", "", clearAdminCookie),
    ]);

    return res.json({
      success: true,
      message: "Logged out successfully from all sessions",
    });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Me (Current Authenticated User) ----------------
export const me = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        loggedIn: false,
        user: null,
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user.id)
      .select("-password -__v")
      .populate("assignedWorkouts")
      .populate("assignedChallenges")
      .populate("assignedClasses")
      .populate("assignedNutritionPlans")
      .lean();

    if (!user) {
      return res.status(401).json({
        loggedIn: false,
        user: null,
        message: "User not found",
      });
    }

    const joined = user.joined
      ? new Date(user.joined).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
      : "Jan 2024";

    res.json({
      loggedIn: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        gender: user.gender || "",
        dob: user.dob || "",
        address: user.address || "",
        avatar: user.avatar || "",
        lastActive: user.lastActive,
        joined,
        membership: user.membership || { plan: "Free", isActive: false },
        healthMetrics: user.healthMetrics || {},
        fitnessPreferences: user.fitnessPreferences || {},
        trainer: user.trainer || {},
        role: user.role || "user",
        assigned: {
          programs: user.assignedWorkouts || [],
          classes: user.assignedClasses || [],
          challenges: user.assignedChallenges || [],
          nutrition: user.assignedNutritionPlans || [],
        },
        purchasedPrograms: user.purchasedPrograms || [],
        purchasedClasses: user.purchasedClasses || [],
        purchasedChallenges: user.purchasedChallenges || [],
        purchasedNutritionPlans: user.purchasedNutritionPlans || [],
        enrolledPrograms: user.enrolledPrograms || [],
        achievements: user.achievements || [],
      },
    });
  } catch (err) {
    console.error("ME Error:", err);
    return res.status(401).json({
      loggedIn: false,
      user: null,
      message: "Token invalid or expired",
    });
  }
};

// बाकी functions (getUserPrograms, saveUserProgress, updateProfile, etc.) 
// पहले जैसे ही रहें — उन्हें बदलने की जरूरत नहीं है
// सिर्फ ऊपर के 5 functions में changes किए गए हैं

// ... (नीचे के सारे functions same as before)