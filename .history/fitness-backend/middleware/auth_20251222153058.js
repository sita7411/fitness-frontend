// middleware/auth.js → FINAL PRODUCTION READY VERSION (December 22, 2025)

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;
    let tokenSource = "none";

    // 1. Priority: admin_token first (so admin stays admin)
    if (req.cookies?.admin_token) {
      token = req.cookies.admin_token;
      tokenSource = "admin_token";
    }
    // 2. Then user_token
    else if (req.cookies?.user_token) {
      token = req.cookies.user_token;
      tokenSource = "user_token";
    }
    // 3. Fallback: Bearer token (for mobile/API clients)
    else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      tokenSource = "Bearer header";
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB (role from DB = most secure)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach to request
    req.user = {
      id: user._id,
      _id: user._id,
      role: user.role,         
      name: user.name,
      email: user.email,
    };

    console.log(`✅ [AUTH] ${user.email} (${user.role}) authenticated via ${tokenSource}`);
    next();
  } catch (err) {
    console.error("💥 [AUTH] Failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Admin-only access (use after protect)
export const adminprotect = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: Insufficient privileges",
      });
    }
    next();
  };
};