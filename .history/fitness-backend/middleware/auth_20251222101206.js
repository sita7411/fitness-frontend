// middleware/auth.js → FINAL PRODUCTION READY VERSION (December 22, 2025)

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;
    let tokenSource = "none";

    // ⭐ PRIORITY: ADMIN TOKEN KO PEHLE CHECK KARO
    // Yeh ensure karta hai ki agar admin_token present hai, toh admin authenticated rahega
    if (req.cookies.admin_token) {
      token = req.cookies.admin_token;
      tokenSource = "admin_token";
      console.log("🔑 [AUTH] Using admin_token");
    } 
    // Sirf tab user_token check karo jab admin_token na ho
    else if (req.cookies.user_token) {
      token = req.cookies.user_token;
      tokenSource = "user_token";
      console.log("🔑 [AUTH] Using user_token");
    }

    // Bearer token fallback (mobile/API clients ke liye)
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      tokenSource = "Bearer header";
      console.log("🔑 [AUTH] Using Bearer token");
    }

    if (!token) {
      console.log("❌ [AUTH] No authentication token found");
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`🔍 [AUTH] Token decoded → User ID: ${decoded.id} | Role in token: ${decoded.role || 'not set'}`);

    // Fetch user from database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("❌ [AUTH] User not found in database → ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    // Attach authenticated user to request
    req.user = {
      id: user._id,
      role: user.role, // ← MOST SECURE: Database se actual role lete hain (token tampering se bachaav)
      name: user.name,
      email: user.email,
    };

    console.log(`✅ [AUTH] Authenticated → ${user.email} (role: ${user.role}) via ${tokenSource}`);

    next();
  } catch (err) {
    console.error("💥 [AUTH] Authentication failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Admin-only route protector
export const adminprotect = (...allowedRoles) => {
  return (req, res, next) => {
    console.log(`🔒 [ADMIN PROTECT] Checking access → Required roles: ${allowedRoles.join(", ")} | User role: ${req.user?.role || 'none'}`);

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.log("🚫 [ADMIN PROTECT] Access denied – Insufficient privileges");
      return res.status(403).json({
        message: "Access denied: Admin privileges required",
      });
    }

    console.log("✅ [ADMIN PROTECT] Access granted");
    next();
  };
};