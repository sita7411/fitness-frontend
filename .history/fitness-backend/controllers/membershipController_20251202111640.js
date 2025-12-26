import mongoose from "mongoose";
import Membership from "../models/Membership.js";
import User from "../models/User.js";
import Program from "../models/Program.js";
import Challenge from "../models/Challenge.js";
import ClassModel from "../models/Class.js";
import NutritionPlan from "../models/NutritionPlan.js";

// ------------------------------ CREATE MEMBERSHIP ------------------------------
export const createMembership = async (req, res) => {
  const { name, price, duration, features, popular, plans = [] } = req.body;

  try {
    const newMembership = new Membership({
      name,
      price,
      duration,
      features: features || [],
      popular: popular || false,
      plans,
    });

    const saved = await newMembership.save();

    res.status(201).json({
      message: "Membership created successfully!",
      membership: saved,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ------------------------------ GET ALL MEMBERSHIPS ✅ NEW ------------------------------
export const getMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find()
      .populate("workouts challenges classes nutritionPlans")
      .sort({ popular: -1, name: 1 });

    const enrichedMemberships = memberships.map((membership) => ({
      ...membership.toObject(),
      workoutsCount: membership.workouts?.length || 0,
      challengesCount: membership.challenges?.length || 0,
      classesCount: membership.classes?.length || 0,
      nutritionCount: membership.nutritionPlans?.length || 0,
      totalContent:
        (membership.workouts?.length || 0) +
        (membership.challenges?.length || 0) +
        (membership.classes?.length || 0) +
        (membership.nutritionPlans?.length || 0),
    }));

    res.json(enrichedMemberships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------ GET SINGLE MEMBERSHIP ✅ NEW ------------------------------
export const getMembershipById = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id).populate(
      "workouts challenges classes nutritionPlans"
    );

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    res.json({
      ...membership.toObject(),
      workoutsCount: membership.workouts?.length || 0,
      challengesCount: membership.challenges?.length || 0,
      classesCount: membership.classes?.length || 0,
      nutritionCount: membership.nutritionPlans?.length || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------ UPDATE MEMBERSHIP ------------------------------
export const updateMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership)
      return res.status(404).json({ message: "Membership not found" });

    const { name, price, duration, features, popular, plans = [] } = req.body;

    membership.name = name ?? membership.name;
    membership.price = price ?? membership.price;
    membership.duration = duration ?? membership.duration;
    membership.features = features ?? membership.features;
    membership.popular = popular ?? membership.popular;
    membership.plans = plans ?? membership.plans;

    const updated = await membership.save();

    res.status(200).json({
      message: "Membership updated successfully!",
      membership: updated,
    });
  } catch (err) {
    console.error("Update Membership Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------ DELETE MEMBERSHIP ✅ NEW ------------------------------
export const deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await Membership.findById(id);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const usersWithMembership = await User.countDocuments({
      "membership._id": id,
    });

    if (usersWithMembership > 0) {
      return res.status(400).json({
        message: `Cannot delete! ${usersWithMembership} users have this membership active`,
      });
    }

    await Membership.findByIdAndDelete(id);

    res.status(200).json({
      message: `✅ "${membership.name}" membership deleted successfully!`,
    });
  } catch (err) {
    console.error("Delete Membership Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------ ASSIGN MEMBERSHIP TO USER ------------------------------
export const assignMembershipToUser = async (req, res) => {
  try {
    const { userId, membershipId } = req.body;

    // Validation 1: Check format
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(membershipId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid userId or membershipId format" });
    }

    // Validation 2: Check if provided
    if (!userId || !membershipId) {
      return res
        .status(400)
        .json({ message: "User ID and Membership ID required" });
    }

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find ALL programs that match membership plans
    const matchingPrograms = await Program.find({
      plans: { $in: membership.plans },
    });

    // Date calculation
    const startDate = new Date();
    let monthsToAdd = 1;
    const durationStr = membership.duration.toLowerCase();
    if (durationStr.includes("year")) monthsToAdd = 12;
    else if (durationStr.includes("month")) {
      const match = durationStr.match(/(\d+)\s*month/);
      monthsToAdd = match ? parseInt(match[1]) || 1 : 1;
    }
    const endDate = new Date(startDate.getTime());
    endDate.setMonth(startDate.getMonth() + monthsToAdd);

    // Assign membership
    user.membership = {
      _id: membership._id,
      plan: membership.name,
      price: membership.price,
      duration: membership.duration,
      features: membership.features,
      startedAt: startDate,
      expiresAt: endDate,
      isActive: true,
      popular: membership.popular || false,
    };

    user.markModified("membership");

    // Assign programs (avoid duplicates)
    matchingPrograms.forEach((p) => {
      if (
        !user.assignedWorkouts.some((id) => id.toString() === p._id.toString())
      ) {
        user.assignedWorkouts.push(p._id);
      }
    });

    // Add to enrolledPrograms (avoid duplicates)
    matchingPrograms.forEach((program) => {
      const exists = user.enrolledPrograms.some(
        (p) => p.programId.toString() === program._id.toString()
      );
      if (!exists) {
        user.enrolledPrograms.push({
          programId: program._id,
          title: program.title,
          trainerName: program.trainerName || "Self-Guided",
          enrolledAt: new Date(),
          progress: 0,
          completedDays: 0,
        });
      }
    });

    await user.save();

    res.status(200).json({
      message: "✅ Membership and content assigned successfully!",
      membership: user.membership,
      userId: user._id,
      totalAssignedPrograms: matchingPrograms.length,
      programTitles: matchingPrograms.map((p) => p.title),
    });
  } catch (err) {
    console.error("🚨 ASSIGNMENT ERROR:", err);
    res.status(500).json({
      message: "Membership assignment failed",
      error: err.message,
    });
  }
};

// ------------------------------ GET USER AVAILABLE PROGRAMS ------------------------------
export const getUserAvailablePrograms = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("membership")
      .populate("assignedWorkouts");

    if (!user.membership?.isActive) {
      return res.status(403).json({ message: "No active membership" });
    }

    const planTier = user.membership.plan;
    let allowedPlans = ["Basic"];
    if (planTier === "Premium") allowedPlans = ["Basic", "Premium"];
    if (planTier === "Pro") allowedPlans = ["Basic", "Premium", "Pro"];

    const availablePrograms = await Program.find({
      plans: { $in: allowedPlans },
    });

    res.json({
      programs: availablePrograms,
      total: availablePrograms.length,
      membership: user.membership,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};