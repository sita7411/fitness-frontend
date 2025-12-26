// middleware/authUnified.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const protectUnified = async (req, res, next) => {
  try {
    let token = req.cookies?.admin_token || req.cookies?.user_token;

    // Fallback for mobile/Postman
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;

    // अगर JWT में role: "admin" है → Admin load करो
    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id).select("-password");
      if (!user) return res.status(401).json({ success: false, message: "Admin not found" });
    } else {
      // Normal User
      user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(401).json({ success: false, message: "User not found" });
    }

    // पूरा original Mongoose document pass करो
    req.user = user;
    next();
  } catch (err) {
    console.error("Unified Auth Error:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};