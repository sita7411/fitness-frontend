// middleware/authUnified.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const protectUnified = async (req, res, next) => {
  try {
    let token;

    // Cookie se token lo (user ya admin)
    if (req.cookies?.user_token) {
      token = req.cookies.user_token;
    } else if (req.cookies?.admin_token) {
      token = req.cookies.admin_token;
    }

    // Fallback: Bearer token (mobile apps, Postman)
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let authenticatedUser;

    // Pehle Admin check karo (agar JWT mein role: "admin" hai)
    if (decoded.role === "admin") {
      authenticatedUser = await Admin.findById(decoded.id).select("-password");
      if (!authenticatedUser) {
        return res.status(401).json({ success: false, message: "Admin not found" });
      }
      // Role confirm kar do (extra safety)
      authenticatedUser.role = "admin";
    } else {
      // Normal User
      authenticatedUser = await User.findById(decoded.id).select("-password");
      if (!authenticatedUser) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
      authenticatedUser.role = "user"; // agar User model mein role field nahi hai to bhi set kar do
    }

    // Yeh important: pura Mongoose document pass karo
    req.user = authenticatedUser;

    next();
  } catch (err) {
    console.error("Unified Auth Error:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};