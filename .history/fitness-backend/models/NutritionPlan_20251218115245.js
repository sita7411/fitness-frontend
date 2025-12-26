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
  type: {
    type: String,
    required: true,
    enum: ["Breakfast", "Lunch", "Dinner", "Snack", "lunch"], // add "lunch"
    default: "Breakfast",
  },
  title: { type: String, required: true, default: "Untitled Meal" },
  description: { type: String, default: "" },
  thumbnail: {
    url: { type: String, default: null },
    fileName: { type: String, default: null },
  },
  ingredients: [{ type: String, default: "" }],
  instructions: [{ type: String, default: "" }],
  tools: [{ type: String, default: "" }],
  notes: [{ type: String, default: "" }],
  nutrition: { type: NutritionSchema, default: () => ({}) },
   prepTime: { type: Number, default: 10 },      // in minutes
  cookTime: { type: Number, default: 20 },      // in minutes
  difficulty: { type: String, default: "Easy" },
  mealType: { type: String, default: "Veg" },
  totalTime: {
    type: Number,
    default: function () {
      return (this.prepTime || 10) + (this.cookTime || 20);
    },
});

const DaySchema = new mongoose.Schema({
  title: { type: String, required: true, default: "Day 1" },
  meals: [MealSchema],
});

const NutritionPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    coverImage: {
      url: { type: String, required: true },
      fileName: { type: String },
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    price: { type: Number, default: 0 },
    plans: [{ type: String }],
    days: [DaySchema],
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("NutritionPlan", NutritionPlanSchema);
