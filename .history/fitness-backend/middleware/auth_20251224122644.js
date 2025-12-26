

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;
    let tokenSource = "none";

    const isAdminRoute = req.originalUrl.startsWith("/api/admin") ||
                         req.path.startsWith("/admin") ||
                         req.baseUrl?.includes("/admin");

    if (isAdminRoute) {
      if (req.cookies?.admin_token) {
        token = req.cookies.admin_token;
        tokenSource = "admin_token (preferred for admin route)";
      } else if (req.cookies?.user_token) {
        token = req.cookies.user_token;
        tokenSource = "user_token (fallback)";
      }
    } else {
      if (req.cookies?.user_token) {
        token = req.cookies.user_token;
        tokenSource = "user_token (preferred for user route)";
      } else if (req.cookies?.admin_token) {
        token = req.cookies.admin_token;
        tokenSource = "admin_token (fallback)";
      }
    }

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      tokenSource = "Bearer header";
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-password -__v")
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or deleted.",
      });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    // ✅ Safe logging – only when user exists
    console.log(
      `✅ [AUTH] ${user.email} (${user.role.toUpperCase()}) via ${tokenSource} → ${req.originalUrl}`
    );

    next();
  } catch (err) {
    // 💥 ERROR LOGGING – SAFE VERSION (user may not exist here)
    console.error("💥 [AUTH] Failed:", {
      error: err.message,
      name: err.name,
      ip: req.ip || req.connection.remoteAddress,
      url: req.originalUrl,
      time: new Date().toISOString(),
      // Optional: add token source if available (but don't log full token)
      // tokenSource,
    });

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
        message: "Invalid token.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

export const adminprotect = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admin privileges required.",
        requiredRole: allowedRoles.join(" or "),
      });
    }
    next();
  };
};