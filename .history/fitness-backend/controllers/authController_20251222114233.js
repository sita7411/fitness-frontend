// controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

const expiredCookie = {
  ...cookieOptions,
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
      cookie.serialize("user_token", token, cookieOptions)
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
      cookie.serialize("user_token", token, cookieOptions),
      cookie.serialize("admin_token", "", expiredCookie), // Clear any admin session
    ]);

    const joined = user.joined
      ? new Date(user.joined).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      : "Jan 2024";

    return res.json({
      loggedIn: true,
      message: "Login successful!",
      user: { ...user.toObject(), id: user._id, joined },
      token, // Optional: for mobile clients
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
      cookie.serialize("admin_token", token, cookieOptions),
      cookie.serialize("user_token", "", expiredCookie), // Clear any user session
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
export const logout = (req, res) => {
  try {
    res.setHeader("Set-Cookie", [
      cookie.serialize("user_token", "", expiredCookie),
      cookie.serialize("admin_token", "", expiredCookie),
    ]);

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Me (Current User) ----------------
// ... (keep your existing me, getUserPrograms, etc. unchanged)
// They should now all use the single `protect` middleware

// Example route usage in routes file:
// router.get("/me", protect, me);
// router.get("/admin/users", protect, adminprotect("admin"), getAllUsers);