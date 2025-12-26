// controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";

// ========================
// COOKIE OPTIONS WITH PATH SEPARATION
// ========================

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

// User token: only sent on /api/auth/* routes
const userCookieOptions = {
  ...baseCookieOptions,
  path: "/api/auth",
};

// Admin token: only sent on /api/admin/* routes
const adminCookieOptions = {
  ...baseCookieOptions,
  path: "/api/admin",
};

// Clear cookies
const clearUserCookie = { ...userCookieOptions, expires: new Date(0), maxAge: 0 };
const clearAdminCookie = { ...adminCookieOptions, expires: new Date(0), maxAge: 0 };

// ---------------- Signup ----------------
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dob } = req.body;

    if (!name || !email || !password || !phone || !gender || !dob) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone,
      gender,
      dob: new Date(dob),
      avatar: req.file?.path || "",
    });

    const token = jwt.sign({ id: newUser._id, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("user_token", token, userCookieOptions)
    );

    return res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar || null,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Login (User) ----------------
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

    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.setHeader("Set-Cookie", [
      cookie.serialize("user_token", token, userCookieOptions),
      cookie.serialize("admin_token", "", clearAdminCookie), // Clear admin session
    ]);

    const joined = user.joined
      ? new Date(user.joined).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      : "Jan 2024";

    return res.json({
      loggedIn: true,
      message: "Login successful!",
      user: { ...user.toObject(), id: user._id, joined },
      token,
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

    const admin = await User.findOne({
      email: email.toLowerCase(),
      role: "admin",
    }).select("+password");

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.setHeader("Set-Cookie", [
      cookie.serialize("admin_token", token, adminCookieOptions),
      cookie.serialize("user_token", "", clearUserCookie), // Clear user session
    ]);

    const userData = admin.toObject();
    delete userData.password;

    res.json({ message: "Admin login successful", user: userData });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Logout ----------------
export const logout = async (req, res) => {
  try {
    res.setHeader("Set-Cookie", [
      cookie.serialize("user_token", "", clearUserCookie),
      cookie.serialize("admin_token", "", clearAdminCookie),
    ]);

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Me (Current User) ----------------
// (बाकी functions same रहेंगे – कोई बदलाव नहीं)
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
      .populate("assignedWorkouts")
      .populate("assignedChallenges")
      .populate("assignedClasses")
      .populate("assignedNutritionPlans");

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

// बाकी सभी functions (getUserPrograms, getAllUsers, etc.) same रहेंगे
// कोई बदलाव नहीं चाहिए उनमें

// ... (नीचे के सारे functions copy-paste कर दो जैसा पहले था)