// models/Class.js
import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ["time", "reps"], default: "time" },
  time: { type: Number },
  reps: { type: Number },
  sets: { type: Number },
  notes: { type: String, trim: true },
  thumbnail: { type: String },
  section: {
    type: String,
    enum: ["Warm-up", "Workout", "Cool-down"],
    default: "Workout",
  },
});

const daySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  exercises: [exerciseSchema],
});

const classSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    thumbnail: { type: String },
    price: { type: Number, default: 0, min: 0 },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    duration: { type: String, trim: true },
    trainerName: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    plans: [
      {
        type: String,
        enum: ["Basic", "Premium", "Pro"],
      },
    ],
    date: { type: Date },
    time: { type: String },
    caloriesBurned: { type: String, trim: true },
    equipment: [{ type: String, trim: true }],
    days: [daySchema],
  },
  { timestamps: true }
);

// ========== ClassProgress Schema (Separate Model) ==========

const classProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  completedExercises: [{ type: String }], // exercise _id as string
  lastCompletedDate: { type: Date },
  streak: { type: Number, default: 0 },
  achievements: [{ type: String }], // e.g., 'first_ex', 'ten_ex', 'seven_day_streak'
}, { timestamps: true });

// Unique index: one progress document per user per class
classProgressSchema.index({ user: 1, classId: 1 }, { unique: true });

// Export both models
const Class = mongoose.model("Class", classSchema);
const ClassProgress = mongoose.model("ClassProgress", classProgressSchema);

export { Class, ClassProgress };
export default Class; // default export for backward compatibility