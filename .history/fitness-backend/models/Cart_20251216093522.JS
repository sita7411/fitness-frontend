// src/models/Cart.js
import mongoose from "mongoose";
// models/Cart.js
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [
    {
      id: { type: String, required: true }, // or ObjectId if you prefer
      type: { type: String, required: true }, // program, class, etc.
      title: String,
      price: { type: Number, required: true },
      thumbnail: String,
      quantity: { type: Number, default: 1 },
    },
  ],
  totalAmount: { type: Number, default: 0 },
  itemCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);