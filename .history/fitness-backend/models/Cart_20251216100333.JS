// models/Cart.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ["program", "class", "challenge", "nutrition"], // optional: restrict types
  },
  title: { type: String, required: true },
  desc: { type: String, default: "No description available" },
  
  // Image - rename from thumbnail to image for consistency with frontend
  image: { type: String, default: "/placeholder-program.jpg" },
  
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },

  // 🔥 YE SAB ADD KARO - YEHI MISSING THE!
  duration: { type: String, default: "4-8 Weeks" },
  difficulty: { type: String, default: "All Levels" },
  trainerName: { type: String, default: "Self-Guided" },
  
  // Optional: agar classes mein level use hota hai
  level: { type: String },
}, { _id: false }); 

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],

    // Optional: auto-calculate kar sakte ho pre-save hook se
    totalAmount: { type: Number, default: 0 },
    itemCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cartSchema.pre("save", async function () {
  this.itemCount = this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
});

export default mongoose.model("Cart", cartSchema);