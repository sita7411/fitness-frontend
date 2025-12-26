// middleware/auth.js  ← FINAL VERSION (December 2025)

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Cookie से token लो (user या admin दोनों के लिए)
    token = req.cookies.user_token || req.cookies.admin_token;

    // अगर cookie में नहीं तो Bearer header से
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Token verify करो
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User को load करो (admin हो या normal user, same collection)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // req.user में डाल दो (role भी आएगा automatically)
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({
      message: "Invalid or expired token",
      error: err.message,
    });
  }
};

// Admin-only routes के लिए
export const adminprotect = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: Insufficient permissions" });
    }
    next();
  };
};
