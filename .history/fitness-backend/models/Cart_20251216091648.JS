// src/models/Cart.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  id: { type: String, required: true },         // program/challenge/class/nutrition ka _id
  type: { 
    type: String, 
    required: true,
    enum: ["program", "challenge", "class", "nutrition"],
    default: "program"
  },
  title: { type: String, required: true },
  desc: { type: String },
  image: { type: String },
  price: { type: Number, required: true },
  duration: { type: String },
  difficulty: { type: String },
  trainerName: { type: String },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,                
  },
  items: [cartItemSchema],
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);