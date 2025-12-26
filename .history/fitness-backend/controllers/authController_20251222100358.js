// controllers/authController.js → FULL FINAL PRODUCTION + DEBUG VERSION (December 22, 2025)

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Program from "../models/Program.js";

// ==================== SIGNUP ====================
export const signup = async (req, res) => {
  try {
    console.log("🔵 [SIGNUP] Request received → Body:", req.body);

    const { name, email, password, phone, gender, dob } = req.body;

    if (!name || !email || !password || !phone || !gender || !dob) {
      console.log("❌ [SIGNUP] Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      console.log("❌ [SIGNUP] Email already registered:", normalizedEmail);
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
      gender,
      dob: new Date(dob),
      avatar: req.file?.path || "",
      role: "user", // Explicitly set
    });

    const token = jwt.sign(
      { id: newUser._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("user_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      })
    );

    console.log("✅ [SIGNUP] Success → User ID:", newUser._id, "| Email:", newUser.email);
    console.log("🍪 [SIGNUP] user_token cookie set");

    return res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar || null,
      },
    });
  } catch (err) {
    console.error("💥 [SIGNUP] Server Error:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================== USER LOGIN ====================
export const login = async (req, res) => {
  try {
    console.log("🔵 [USER LOGIN] Attempt → Email:", req.body.email || "missing");

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ [USER LOGIN] Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("❌ [USER LOGIN] User not found:", normalizedEmail);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ [USER LOGIN] Incorrect password:", normalizedEmail);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // BLOCK ADMIN FROM CUSTOMER LOGIN ENDPOINT
    if (user.role === "admin") {
      console.log("🚫 [USER LOGIN] BLOCKED → Admin tried customer login:", normalizedEmail);
      return res.status(403).json({
        message: "Admins cannot login here. Use the admin panel.",
      });
    }

    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("user_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      })
    );

    console.log("✅ [USER LOGIN] Success → Email:", user.email, "| Role:", user.role);
    console.log("🍪 [USER LOGIN] user_token cookie set");

    const joined = user.joined
      ? new Date(user.joined).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      : "Jan 2024";

    return res.json({
      loggedIn: true,
      message: "Login successful!",
      user: {
        ...user.toObject(),
        id: user._id,
        joined,
      },
      token,
    });
  } catch (err) {
    console.error("💥 [USER LOGIN] Server Error:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================== ADMIN LOGIN ====================
export const adminLogin = async (req, res) => {
  try {
    console.log("🔵 [ADMIN LOGIN] Attempt → Email:", req.body.email || "missing");

    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: normalizedEmail,
      role: "admin",
    }).select("+password");

    if (!user) {
      console.log("❌ [ADMIN LOGIN] No admin found:", normalizedEmail);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ [ADMIN LOGIN] Wrong password:", normalizedEmail);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    const userData = user.toObject();
    delete userData.password;

    console.log("✅ [ADMIN LOGIN] Success → Admin:", user.email);
    console.log("🍪 [ADMIN LOGIN] admin_token cookie set");

    res.json({ message: "Admin login successful", user: userData });
  } catch (err) {
    console.error("💥 [ADMIN LOGIN] Server Error:", err.message || err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== LOGOUT ====================
export const logout = (req, res) => {
  try {
    console.log("🔵 [LOGOUT] Request received");

    res.setHeader("Set-Cookie", [
      cookie.serialize("user_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
      }),
      cookie.serialize("admin_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
      }),
    ]);

    console.log("🍪 [LOGOUT] Both cookies cleared");

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("💥 [LOGOUT] Error:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================== ME (CURRENT USER) ====================
export const me = async (req, res) => {
  try {
    console.log("🔵 [/me] Request → Decoded ID:", req.user?.id, "| Role:", req.user?.role);

    if (!req.user || !req.user.id) {
      console.log("❌ [/me] No authenticated user");
      return res.status(401).json({
        loggedIn: false,
        user: null,
        message: "Not authorized",
      });
    }

    const user = await User.findById(req.user.id)
      .populate("assignedWorkouts")
      .populate("assignedChallenges")
      .populate("assignedClasses")
      .populate("assignedNutritionPlans");

    if (!user) {
      console.log("❌ [/me] User not found in DB → ID:", req.user.id);
      return res.status(401).json({
        loggedIn: false,
        user: null,
        message: "User not found",
      });
    }

    console.log("✅ [/me] Success → Email:", user.email, "| Role:", user.role);

    const joined = user.joined
      ? new Date(user.joined).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      : "Jan 2024";

    res.json({
      loggedIn: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        gender: user.gender || "",
        dob: user.dob || "",
        address: user.address || "",
        avatar: user.avatar || "",
        lastActive: user.lastActive,
        joined,
        membership: user.membership || { plan: "Free", isActive: false },
        healthMetrics: user.healthMetrics || {},
        fitnessPreferences: user.fitnessPreferences || {},
        trainer: user.trainer || {},
        role: user.role || "user",
        assigned: {
          programs: user.assignedWorkouts || [],
          classes: user.assignedClasses || [],
          challenges: user.assignedChallenges || [],
          nutrition: user.assignedNutritionPlans || [],
        },
        purchasedPrograms: user.purchasedPrograms || [],
        purchasedClasses: user.purchasedClasses || [],
        purchasedChallenges: user.purchasedChallenges || [],
        purchasedNutritionPlans: user.purchasedNutritionPlans || [],
      },
    });
  } catch (err) {
    console.error("💥 [/me] Error:", err.message || err);
    return res.status(401).json({
      loggedIn: false,
      user: null,
      message: "Token invalid or expired",
    });
  }
};

// ==================== USER PROGRAMS ====================
export const getUserPrograms = async (req, res) => {
  try {
    console.log("🔵 [GET PROGRAMS] User ID:", req.user.id);

    const user = await User.findById(req.user.id).populate({
      path: "enrolledPrograms.programId",
      model: "Program",
      match: { status: "Active" },
    });

    if (!user.membership?.isActive) {
      console.log("⚠️ [GET PROGRAMS] No active membership");
      return res.json({
        programs: [],
        total: 0,
        message: "No active membership found",
      });
    }

    const programs = user.enrolledPrograms
      .filter((ep) => ep.programId)
      .map((ep) => ep.programId)
      .filter((p, index, self) => self.indexOf(p) === index);

    console.log(`✅ [GET PROGRAMS] Loaded ${programs.length} programs`);

    res.json({
      programs,
      total: programs.length,
      membership: user.membership,
    });
  } catch (err) {
    console.error("💥 [GET PROGRAMS] Error:", err.message || err);
    res.status(500).json({ message: "Failed to load programs" });
  }
};

// ==================== USER PROGRESS ====================
export const getUserProgress = async (req, res) => {
  try {
    console.log("🔵 [GET PROGRESS] User ID:", req.user.id);
    const user = await User.findById(req.user.id);

    res.json({
      completedExercises: user.completedExercises || [],
      enrolledPrograms: user.enrolledPrograms || [],
      progress: user.progress || {},
    });
  } catch (err) {
    console.error("💥 [GET PROGRESS] Error:", err.message || err);
    res.status(500).json({ message: "Failed to load progress" });
  }
};

export const saveUserProgress = async (req, res) => {
  try {
    console.log("🔵 [SAVE PROGRESS] Request → Body:", req.body);

    const { programId, exerciseId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.completedExercises) user.completedExercises = [];

    const exerciseIdStr = exerciseId.toString();
    if (!user.completedExercises.includes(exerciseIdStr)) {
      user.completedExercises.push(exerciseIdStr);

      const enrolledProgram = user.enrolledPrograms.find(
        (ep) => ep.programId.toString() === programId
      );

      if (enrolledProgram) {
        enrolledProgram.progress = (enrolledProgram.progress || 0) + 1;
        enrolledProgram.lastCompleted = new Date();
      }

      await user.save();

      console.log(`✅ [SAVE PROGRESS] Exercise ${exerciseIdStr} saved for program ${programId}`);
      res.json({
        message: "Progress saved successfully!",
        totalCompleted: user.completedExercises.length,
      });
    } else {
      console.log("⚠️ [SAVE PROGRESS] Exercise already completed");
      res.json({ message: "Exercise already completed" });
    }
  } catch (err) {
    console.error("💥 [SAVE PROGRESS] Error:", err.message || err);
    res.status(500).json({ message: "Failed to save progress" });
  }
};

// ==================== PROFILE & PASSWORD ====================
export const updateProfile = async (req, res) => {
  try {
    console.log("🔵 [UPDATE PROFILE] User ID:", req.user?.id);

    const token = req.cookies?.user_token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("❌ [UPDATE PROFILE] No token");
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("❌ [UPDATE PROFILE] User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const fields = [
      "name", "email", "phone", "gender", "dob", "address",
      "healthMetrics", "fitnessPreferences", "trainer"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (req.file?.path) user.avatar = req.file.path;

    await user.save();

    const joined = user.joined
      ? new Date(user.joined).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      : "Jan 2024";

    console.log("✅ [UPDATE PROFILE] Success");
    res.json({
      message: "Profile updated successfully",
      user: { ...user.toObject(), joined },
    });
  } catch (err) {
    console.error("💥 [UPDATE PROFILE] Error:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    console.log("🔵 [CHANGE PASSWORD] Request");

    const token = req.cookies?.user_token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    console.log("✅ [CHANGE PASSWORD] Success");
    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("💥 [CHANGE PASSWORD] Error:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    console.log("🔵 [UPDATE PREFERENCES] Request");

    const token = req.cookies?.user_token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    const { emailNotifications, smsNotifications, accountAlerts } = req.body;

    user.emailNotifications = emailNotifications ?? user.emailNotifications;
    user.smsNotifications = smsNotifications ?? user.smsNotifications;
    user.accountAlerts = accountAlerts ?? user.accountAlerts;

    await user.save();

    console.log("✅ [UPDATE PREFERENCES] Success");
    res.json({
      message: "Preferences saved successfully",
      preferences: {
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
        accountAlerts: user.accountAlerts,
      },
    });
  } catch (err) {
    console.error("💥 [UPDATE PREFERENCES] Error:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================== ADMIN FUNCTIONS ====================
export const getAllUsers = async (req, res) => {
  try {
    console.log("🔵 [ADMIN] Get all users → Query:", req.query);

    const { page = 1, limit = 10, search = "", status = "all" } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
      ];
    }

    const today = new Date();
    if (status !== "all") {
      if (status === "active") filter["membership.expiresAt"] = { $gte: today };
      if (status === "expired") filter["membership.expiresAt"] = { $lt: today };
      if (status === "pending") filter["membership.expiresAt"] = null;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    const formatted = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      joinDate: u.joined || u.createdAt,
      membership: u.membership?.expiresAt
        ? new Date(u.membership.expiresAt) >= today ? "Active" : "Expired"
        : "Pending",
      plan: u.membership?.plan || "No Plan",
      programsCount: u.enrolledPrograms?.length || 0,
      avatar: u.avatar || u.name.split(" ").map((n) => n[0]).join(""),
    }));

    console.log(`✅ [ADMIN] Returning ${users.length} users (total: ${total})`);

    res.json({
      success: true,
      users: formatted,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("💥 [ADMIN] Get All Users Error:", err.message || err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    console.log("🔵 [ADMIN] Get user by ID:", req.params.id);

    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("enrolledPrograms.programId");

    if (!user) {
      console.log("❌ [ADMIN] User not found");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const today = new Date();

    const formattedUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      joinDate: user.joined || user.createdAt,
      membership: user.membership?.expiresAt
        ? new Date(user.membership.expiresAt) >= today ? "Active" : "Expired"
        : "Pending",
      plan: user.membership?.plan || "No Plan",
      programsCount: user.enrolledPrograms?.length || 0,
      programs: user.enrolledPrograms?.map((ep) => ({
        title: ep.programId?.title || ep.title,
        progress: ep.progress || 0,
      })) || [],
      avatar: user.avatar,
    };

    console.log("✅ [ADMIN] User data fetched");
    res.json({ success: true, user: formattedUser });
  } catch (err) {
    console.error("💥 [ADMIN] Get User Error:", err.message || err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    console.log("🔵 [ADMIN] Delete user ID:", req.params.id);

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      console.log("❌ [ADMIN] User not found for deletion");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("✅ [ADMIN] User deleted:", req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("💥 [ADMIN] Delete User Error:", err.message || err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};