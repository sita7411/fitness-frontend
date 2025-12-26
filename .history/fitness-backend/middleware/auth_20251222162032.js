// middleware/auth.js → FINAL PRODUCTION READY VERSION (December 22, 2025)
// Supports simultaneous user + admin sessions with admin_token priority

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;
    let tokenSource = "none";

    // Priority order: admin_token > user_token > Bearer token
    if (req.cookies?.admin_token) {
      token = req.cookies.admin_token;
      tokenSource = "admin_token";
    } else if (req.cookies?.user_token) {
      token = req.cookies.user_token;
      tokenSource = "user_token";
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      tokenSource = "Bearer header";
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login.",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB (always more secure than trusting token data)
    const user = await User.findById(decoded.id)
      .select("-password -__v") // exclude sensitive/unnecessary fields
      .lean(); // faster performance (no mongoose document overhead)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or account has been deleted.",
      });
    }

    // Attach user data to request (minimal but useful)
    req.user = {
      id: user._id.toString(),
      _id: user._id, // both string and ObjectId for flexibility
      role: user.role,
      name: user.name,
      email: user.email,
      // You can add more fields here if needed in middleware later
      // lastActive: user.lastActive,
    };

    // Structured logging (remove or reduce in production if too noisy)
    console.log(
      `✅ [AUTH] ${user.email} (${user.role.toUpperCase()}) authenticated via ${tokenSource} at ${new Date().toISOString()}`
    );

    next();
  } catch (err) {
    console.error("💥 [AUTH] Failed:", {
      error: err.message,
      token: token ? token.substring(0, 20) + "..." : "none", // partial token for safety
      ip: req.ip || "unknown",
      time: new Date().toISOString(),
    });

    // Differentiate between expired and invalid token
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
        expired: true,
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please login.",
    });
  }
};

// Admin-only middleware (use after protect)
export const adminprotect = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: This route is only for administrators.",
        requiredRole: allowedRoles.join(" or "),
      });
    }
    next();
  };
};