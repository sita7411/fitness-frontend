import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  id: { type: String, required: true },     // product / program id
  type: { type: String, required: true },   // program, class, etc.
  title: String,
  price: { type: Number, required: true },
  thumbnail: String,
  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],

    totalAmount: { type: Number, default: 0 },
    itemCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* ✅ AUTO CALCULATE TOTALS */
cartSchema.pre("save", function (next) {
  this.itemCount = this.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  next();
});

export default mongoose.model("Cart", cartSchema);
