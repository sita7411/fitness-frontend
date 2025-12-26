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
    notes: { type: String, default: "" },
    thumbnail: { type: String, default: null }, // store image URL/path
  },
  { _id: true }
);

const DaySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    exercises: [ExerciseSchema],
  },
  { _id: true }
);

const ProgramSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
    thumbnail: { type: String, default: null }, // main cover image URL/path
    duration: {
      type: String,
      enum: ["15 – 30 min", "30 – 45 min", "45 – 60 min"],
      default: "30 – 45 min",
    },
    level: {
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
    days: [DaySchema],
     status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Program = mongoose.model("Program", ProgramSchema);

export default Program;
