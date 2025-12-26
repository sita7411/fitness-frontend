
import Challenge from "../models/Challenge.js";
import User from "../models/User.js";

import mongoose from "mongoose";

// ------------------ Helper: Transform Frontend → Backend (Same as Class) ------------------
const transformFrontendToBackend = (
  data,
  thumbnailUrl = null,
  stepImages = {}
) => {
  const existingThumbnail =
    data.thumbnail && typeof data.thumbnail === "object"
      ? data.thumbnail.url
      : data.thumbnail;

  const daysWithImages = (data.days || []).map((day) => ({
    title: day.title,
    steps: (day.steps || []).map((step) => {
      const key = `step-${day._id}-${step._id}`;
      const newImage = stepImages[key];
      const oldImage =
        step.image && typeof step.image === "object" ? step.image.url : step.image;

      return {
        type: step.type,
        name: step.name,
        duration: step.duration,
        reps: step.reps,
        image: newImage || oldImage || null,
        calories: step.calories || 0,
      };
    }),
  }));

  return {
    title: data.title || "Untitled Challenge",
    description: data.description || "",
    thumbnail: thumbnailUrl || existingThumbnail || null,
    categories: data.categories || [],
    difficulty: data.difficulty || "Beginner",
    equipment: data.equipment || [],
    totalDays: data.totalDays || daysWithImages.length,
    totalTime: data.totalTime || 0,
    totalCalories: data.totalCalories || 0,
    days: daysWithImages,
    price: Number(data.price) || 0,
    plans: data.plans || [],
    rating: {
      average: Number(data.rating?.average) || 0,
      count: Number(data.rating?.count) || 0,
    },
  };
};

// ------------------ Helper: Safe JSON Parse ------------------
const parseIfString = (val) => {
  if (!val) return {};
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (e) {
      console.warn("JSON parse failed in challenge:", e);
      return {};
    }
  }
  return val;
};

// ------------------ CREATE CHALLENGE (Same as Class) ------------------
export const createChallenge = async (req, res) => {
  try {
    console.log("CREATE CHALLENGE START");

    let data = parseIfString(req.body.data || req.body.challenge);

    const mainThumbnail = req.files?.find((f) => f.fieldname === "thumbnail")?.path || null;

    const stepImages = {};
    req.files?.forEach((f) => {
      if (f.fieldname.startsWith("step-")) {
        const key = f.fieldname; // format: step-dayId-stepId
        stepImages[key] = f.path;
      }
    });

    const transformed = transformFrontendToBackend(data, mainThumbnail, stepImages);

    const newChallenge = new Challenge(transformed);
    const saved = await newChallenge.save();

    console.log("CHALLENGE SAVED:", saved._id);
    res.status(201).json(saved);
  } catch (err) {
    console.error("CREATE CHALLENGE ERROR:", err);
    res.status(500).json({ message: "Failed to create challenge", error: err.message });
  }
};

// ------------------ UPDATE CHALLENGE (Same as Class) ------------------
export const updateChallenge = async (req, res) => {
  try {
    let data = parseIfString(req.body.data || req.body.challenge);

    const mainThumbnail = req.files?.find((f) => f.fieldname === "thumbnail")?.path || null;

    const stepImages = {};
    req.files?.forEach((f) => {
      if (f.fieldname.startsWith("step-")) {
        stepImages[f.fieldname] = f.path;
      }
    });

    const transformed = transformFrontendToBackend(data, mainThumbnail, stepImages);

    const updated = await Challenge.findByIdAndUpdate(req.params.id, transformed, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Challenge not found" });

    res.json(updated);
  } catch (err) {
    console.error("UPDATE CHALLENGE ERROR:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ------------------ GET ALL CHALLENGES ------------------
export const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 }).lean();
    res.json(challenges);
  } catch (err) {
    console.error("GET CHALLENGES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch challenges" });
  }
};

// ------------------ GET BY ID ------------------
export const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const challenge = await Challenge.findById(id).lean();
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    res.json(challenge);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ DELETE CHALLENGE ------------------
export const deleteChallenge = async (req, res) => {
  try {
    const deleted = await Challenge.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Challenge deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// ------------------ GET USER CHALLENGES — FINAL PERFECT (Same as getUserClasses) ------------------
export const getUserChallenges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    let finalChallenges = [];

    // 1. PURCHASED CHALLENGES
    for (const purchased of user.purchasedChallenges || []) {
      if (!purchased.challengeId) continue;

      let objId;
      try {
        objId = new mongoose.Types.ObjectId(String(purchased.challengeId));
      } catch (err) {
        console.warn("Invalid challengeId:", purchased.challengeId);
        continue;
      }

      const ch = await Challenge.findById(objId).lean();
      if (ch) finalChallenges.push(ch);
    }

    // 2. ASSIGNED CHALLENGES
    for (const assignedId of user.assignedChallenges || []) {
      if (!assignedId) continue;

      let objId;
      try {
        objId = new mongoose.Types.ObjectId(String(assignedId));
      } catch (err) {
        continue;
      }

      const ch = await Challenge.findById(objId).lean();
      if (ch) finalChallenges.push(ch);
    }

    // 3. MEMBERSHIP CHALLENGES
    if (user.membership?.isActive) {
      const plan = user.membership.plan?.toLowerCase() || "";
      const allowedPlans = {
        basic: ["Basic"],
        premium: ["Basic", "Premium"],
        pro: ["Basic", "Premium", "Pro"],
      }[plan] || [];

      if (allowedPlans.length > 0) {
        const memChalls = await Challenge.find({
          plans: { $in: allowedPlans },
        }).lean();
        finalChallenges.push(...memChalls);
      }
    }

    // REMOVE DUPLICATES
    const unique = Object.values(
      finalChallenges.reduce((acc, ch) => {
        acc[ch._id] = ch;
        return acc;
      }, {})
    );

    // CLEAN RESPONSE (same format as classes)
    const clean = unique.map((ch) => ({
      _id: ch._id,
      id: ch._id.toString(),
      title: ch.title,
      description: ch.description || "",
      thumbnail: ch.thumbnail || "/default-challenge.png",
      totalDays: ch.days?.length || 0,
      days: ch.days || [],
      plans: ch.plans || [],
      price: ch.price || 0,
    }));

    res.json({ challenges: clean, total: clean.length });
  } catch (err) {
    console.error("getUserChallenges Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ MARK CHALLENGE AS COMPLETED ------------------
export const completeChallenge = async (req, res) => {
  try {
    const { totalMinutes, caloriesBurned } = req.body;

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Prevent duplicate completion on same day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyCompletedToday = challenge.completedBy?.some(
      (entry) =>
        entry.user?.toString() === req.user._id.toString() &&
        new Date(entry.completedAt) >= today
    );

    if (alreadyCompletedToday) {
      return res.json({ message: "Challenge already completed today" });
    }

    challenge.completedBy.push({
      user: req.user._id,
      totalMinutes: totalMinutes ? Number(totalMinutes) : undefined,
      caloriesBurned: caloriesBurned ? Number(caloriesBurned) : undefined,
      completedAt: new Date(),
    });

    await challenge.save();

    res.json({
      success: true,
      message: "Challenge completed successfully!",
    });
  } catch (err) {
    console.error("COMPLETE CHALLENGE ERROR:", err);
    res.status(500).json({ message: "Failed to complete challenge" });
  }
};