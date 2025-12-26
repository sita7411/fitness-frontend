// models/BusinessGoal.js
import mongoose from "mongoose";

const businessGoalSchema = mongoose.Schema(
  {
    period: {
      type: String, // "2025-12"
      required: true,
      unique: true,
    },
    revenueTarget: {
      type: Number,
      required: true,
      default: 2500000,
    },
    memberGrowthTarget: {
      type: Number,
      required: true,
      default: 1500,
    },
    retentionTarget: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 92,
    },
    setBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const BusinessGoal = mongoose.model("BusinessGoal", businessGoalSchema);
export default BusinessGoal;