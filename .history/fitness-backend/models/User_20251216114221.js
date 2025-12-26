// models/User.js
import mongoose from "mongoose";

const enrolledProgramSchema = new mongoose.Schema({
  programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
  title: String,
  trainerName: String,
  enrolledAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
  completedDays: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: String,
    gender: String,
    dob: Date,
    avatar: String,
    address: String,
    joined: { type: Date, default: Date.now },
    lastActive: Date,

    // ← YE UPDATED MEMBERSHIP SCHEMA HAI
    membership: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Membership" },
      plan: { type: String, default: "Free" },
      price: Number,
      duration: String,
      features: [String],
      startedAt: Date,
      expiresAt: Date,
      isActive: { type: Boolean, default: false },
      popular: Boolean,
    },

    healthMetrics: Object,
    fitnessPreferences: Object,
    trainer: Object,

    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    accountAlerts: { type: Boolean, default: true },

    // Assigned content
    assignedWorkouts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }],
   /* assignedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Challenge" }], */
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
   /* assignedNutritionPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "NutritionPlan" }], */

    // Purchased content
    purchasedPrograms: [{
      programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
      title: String,
      trainerName: String,
      purchaseDate: Date,
      status: String,
    }],
    purchasedClasses: [{
      classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
      title: String,
      trainerName: String,
      purchaseDate: Date,
      status: String,
    }],
   /* purchasedChallenges: [{
      challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" },
      title: String,
      trainerName: String,
      purchaseDate: Date,
      status: String,
    }],
    purchasedNutritionPlans: [{
      planId: { type: mongoose.Schema.Types.ObjectId, ref: "NutritionPlan" },
      title: String,
      trainerName: String,
      purchaseDate: Date,
      status: String,
    }],

    enrolledPrograms: [enrolledProgramSchema],
    completedExercises: [{ type: String }],
    progress: Object,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);