// src/models/NutritionPlan.js
import mongoose from "mongoose";

const NutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  cholesterol: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
});

const MealSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ["Breakfast", "Lunch", "Dinner", "Snack"], default: "Breakfast" },
  title: { type: String, required: true, default: "Untitled Meal" },
  description: { type: String, default: "" },
  thumbnail: { type: String, default: null }, 
  ingredients: [{ type: String, default: "" }],
  instructions: [{ type: String, default: "" }],
  tools: [{ type: String, default: "" }],
  notes: [{ type: String, default: "" }],
  nutrition: { type: NutritionSchema, default: () => ({}) },
});

const DaySchema = new mongoose.Schema({
  title: { type: String, required: true, default: "Day 1" },
  meals: [MealSchema],
});

const NutritionPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  description: { type: String, default: "" },
  coverImage: {
    url: { type: String, required: true },
    fileName: { type: String }, // Cloudinary public_id for deletion
  },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  price: { type: Number, default: 0 },
  plans: [{ type: String }], 
  days: [DaySchema],
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
}, {
  timestamps: true,
});

export default mongoose.model("NutritionPlan", NutritionPlanSchema);