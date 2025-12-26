import mongoose from "mongoose";

const enrolledProgramSchema = new mongoose.Schema({
  programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
  progress: { type: Number, default: 0 },
  lastCompleted: Date,
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
    membership: {
      plan: { type: String, default: "Free" },
      isActive: { type: Boolean, default: false },
      expiresAt: Date,
    },
    healthMetrics: Object,
    fitnessPreferences: Object,
    trainer: Object,
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    accountAlerts: { type: Boolean, default: true },

    // Assigned items
    assignedWorkouts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }],
    assignedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }],
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }],
    assignedNutritionPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }],

    purchasedPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }],
    purchasedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }],
    purchasedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }],
    purchasedNutritionPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }],

    enrolledPrograms: [enrolledProgramSchema],
    completedExercises: [{ type: String }], // store exercise IDs as strings
    progress: Object,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
