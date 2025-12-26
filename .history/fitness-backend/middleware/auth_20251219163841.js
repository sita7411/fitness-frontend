// middleware/auth.js  (NEW UNIFIED)
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Cookie se (common cookie name)
    if (req.cookies?.auth_token) {
      token = req.cookies.auth_token;
    }

    // Fallback: Bearer header (mobile/postman)
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let authenticatedUser;

    if (decoded.role === "admin") {
      authenticatedUser = await Admin.findById(decoded.id).select("-password");
    } else {
      authenticatedUser = await User.findById(decoded.id).select("-password");
    }

    if (!authenticatedUser) {
      return res.status(401).json({ success: false, message: "Account not found" });
    }

    req.user = authenticatedUser;
    req.user.role = decoded.role; // ensure role available

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    res.clearCookie("auth_token");
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Admin only routes ke liye
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};