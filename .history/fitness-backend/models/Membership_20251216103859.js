// models/Membership.js
import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // "Basic", "Premium", "Pro" jaise unique names
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      // Examples: "1 Month", "3 Months", "6 Month" (tumhare data mein "6 Month" hai note kar)
    },
    features: {
      type: [String],
      required: true,
      default: [],
    },
    popular: {
      type: Boolean,
      default: false,
    },
    plans: {
      type: [String],
      default: [],
      // Possible values jo tum use kar rahe ho admin panel mein
      enum: ["Basic", "Premium", "Pro"],
    },
    // Yeh fields tumhare purane data mein empty arrays ke roop mein exist kar rahe hain
    // Inko rakh rahe hain backward compatibility ke liye (agar future mein direct link karna ho)
    workouts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Program",
      default: [],
    },
    challenges: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Challenge",
      default: [],
    },
    classes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Class",
      default: [],
    },
    nutritionPlans: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "NutritionPlan",
      default: [],
    },
  },
  {
    timestamps: true, 
  }
);

membershipSchema.index({ popular: -1 });
membershipSchema.index({ name: 1 });

export default mongoose.model("Membership", membershipSchema);