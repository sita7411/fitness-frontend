// models/Program.js
import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["time", "reps"], required: true },
    time: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    sets: { type: Number, default: 0 },
    section: {
      type: String,
      enum: ["Warm-up", "Workout", "Cool-down"],
      default: "Workout",
    },
    description: { type: String, default: "" }, // renamed from 'notes' for consistency with frontend
    thumbnail: { type: String, default: null },
  },
  { _id: true } // keeps MongoDB _id for each exercise (useful as stable reference)
);

const DaySchema = new mongoose.Schema(
  {
    day: { type: Number }, // explicitly add day number (1,2,3...) – helpful for queries
    title: { type: String, required: true, trim: true },
    exercises: [ExerciseSchema],
  },
  { _id: true }
);

const ProgramSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true }, // your custom string ID (e.g. UUID)

    title: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
    thumbnail: { type: String, default: null },
    duration: {
      type: String,
      enum: ["15 – 30 min", "30 – 45 min", "45 – 60 min"],
      default: "30 – 45 min",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    trainingType: {
      type: String,
      enum: ["Full Body", "Upper Body", "Lower Body", "Cardio", "Strength"],
      default: "Full Body",
    },
    focus: {
      type: String,
      enum: ["General Fitness", "Fat Loss", "Muscle Gain", "Endurance"],
      default: "General Fitness",
    },
    equipment: [{ type: String }],
    price: { type: Number, default: 0 },
    trainerName: { type: String, default: "" },
    caloriesBurned: { type: Number, default: 0 },
    plans: [{ type: String, enum: ["Basic", "Premium", "Pro"] }],
    totalDays: { type: Number }, // optional: cache days.length

    days: [DaySchema],

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    completedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        day: { type: Number, required: true },                    // Day number
        exerciseId: { type: String},              
        completedAt: { type: Date, default: Date.now },
        heartRate: { type: Number },                              // optional per-exercise
        weight: { type: Number },                                 // optional
      },
    ],
  },
  {
    timestamps: true,
  }
);

ProgramSchema.index({ "completedBy.user": 1, "completedBy.completedAt": -1 });
ProgramSchema.index({ id: 1, "completedBy.user": 1 });

const Program = mongoose.model("Program", ProgramSchema);

export default Program;