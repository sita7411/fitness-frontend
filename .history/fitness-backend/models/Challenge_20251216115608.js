import mongoose from "mongoose";

const StepSchema = new mongoose.Schema({
  type: { type: String, enum: ["time", "reps"], required: true },
  name: { type: String, required: true },
  duration: { type: Number }, // seconds, only for "time"
  reps: { type: Number },    // only for "reps"
  image: { type: String },   // URL to uploaded image
  calories: { type: Number, default: 0 },
});

const DaySchema = new mongoose.Schema({
  title: { type: String, required: true },
  steps: [StepSchema],
  // Optional: pre-calculated totals (controller can recalc on save if needed)
  totalTime: { type: Number, default: 0 },
  totalCalories: { type: Number, default: 0 },
});

const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  thumbnail: { type: String }, // URL
  categories: { type: [String], default: [] },
  difficulty: { 
    type: String, 
    enum: ["Beginner", "Intermediate", "Advanced"], 
    default: "Beginner" 
  },
  equipment: { type: [String], default: [] },
  totalDays: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  totalCalories: { type: Number, default: 0 },
  days: [DaySchema],
  included: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  plans: { type: [String], default: [] }, // e.g., ["Basic", "Premium", "Pro"]
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  completedBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      totalMinutes: { type: Number },
      caloriesBurned: { type: Number },
      completedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

export default mongoose.model("Challenge", ChallengeSchema);