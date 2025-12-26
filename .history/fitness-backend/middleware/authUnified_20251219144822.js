// middleware/authUnified.js  (naya file bana lo)

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const protectUnified = async (req, res, next) => {
  try {
    let token;

    // User ya Admin — dono cookies check karo
    if (req.cookies?.user_token) {
      token = req.cookies.user_token;
    } else if (req.cookies?.admin_token) {
      token = req.cookies.admin_token;
    }

    // Header fallback (mobile/Postman)
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pehle Admin try karo (kyunki admin ka role JWT mein hai)
    if (decoded.role === "admin") {
      const admin = await Admin.findById(decoded.id).select("-password");
      if (!admin) return res.status(401).json({ message: "Admin not found" });

      req.user = {
        _id: admin._id,
        id: admin._id,
        role: "admin",
        model: "Admin",
      };
      return next();
    }

    // Warna normal User
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = {
      _id: user._id,
      id: user._id,
      role: "user",
      model: "User",
    };

    next();
  } catch (err) {
    console.error("Unified Auth Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};