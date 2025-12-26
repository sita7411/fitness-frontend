// middleware/auth.js ← FINAL RECOMMENDED VERSION

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;

    // Pehle user_token try karo
    if (req.cookies.user_token) {
      token = req.cookies.user_token;
    }
    else if (req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    // Fallback Bearer token
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      role: decoded.role || user.role || "user",
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
    }
};

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