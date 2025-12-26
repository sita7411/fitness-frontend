// middleware/authUnified.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const protectUnified = async (req, res, next) => {
  try {
    let token;

    // Cookie check – user_token या admin_token
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
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let authenticatedUser;

    // अगर JWT में role: "admin" है तो Admin load करो
    if (decoded.role === "admin") {
      authenticatedUser = await Admin.findById(decoded.id).select("-password");
      if (!authenticatedUser) {
        return res.status(401).json({ success: false, message: "Admin not found" });
      }
      authenticatedUser.role = "admin"; // extra safety
    } else {
      // Normal User
      authenticatedUser = await User.findById(decoded.id).select("-password");
      if (!authenticatedUser) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
      authenticatedUser.role = "user";
    }

    // IMPORTANT: पूरा Mongoose document pass करो
    req.user = authenticatedUser;

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};