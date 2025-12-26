// middleware/auth.js ← FINAL RECOMMENDED VERSION

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // IMPORTANT: Admin token को PRIORITY दो (admin routes के लिए safe)
    if (req.cookies.admin_token) {
      token = req.cookies.admin_token;
    } else if (req.cookies.user_token) {
      token = req.cookies.user_token;
    }

    // Fallback: Bearer header (for API calls if needed)
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // req.user में सिर्फ necessary data डालो (safe & consistent)
    req.user = {
      id: user._id,
      role: decoded.role || user.role || "user",  // token से priority, fallback to DB
      name: user.name,
      email: user.email,
      // add more if needed, but avoid full document
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// Flexible role protection
export const adminprotect = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: Admin privileges required",
      });
    }
    next();
  };
};