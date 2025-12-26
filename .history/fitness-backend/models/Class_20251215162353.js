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
    trainerName: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    plans: [
      {
        type: String,
        enum: ["Basic", "Premium", "Pro"],
      },
    ],
    date: { type: Date }, // Optional scheduled date
    time: { type: String }, // e.g., "18:00"
    caloriesBurned: { type: String, trim: true }, // e.g., "200-300 kcal"
    equipment: [{ type: String, trim: true }], // Array of equipment names
    days: [daySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);