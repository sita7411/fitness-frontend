// middleware/authUnified.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const protectUnified = async (req, res, next) => {
  try {
    let token;

    // सभी possible sources से token लो
    if (req.cookies?.admin_token) {
      token = req.cookies.admin_token;
    } else if (req.cookies?.user_token) {
      token = req.cookies.user_token;
    }

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Pehle decode karo (verify nahi, bas decode)
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    let user;

    // Role ke basis par decide karo kon load karna hai
    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ success: false, message: "Admin not found" });
      }
    } else {
      // Default user
      user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
    }

    // Ab full verify karo (expiry check ke liye)
    jwt.verify(token, process.env.JWT_SECRET);

    req.user = user;
    next();
  } catch (err) {
    console.error("Unified Auth Error:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};