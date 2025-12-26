import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    guestEmail: {
      type: String,
      default: null,
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    userDetails: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      country: String,
    },

    cardDetails: {
      last4: String,
      nameOnCard: String,
      expiry: String,
    },

    programs: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Program",
        },
        title: String,
        price: Number,
      },
    ],

    classes: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Class",
        },
        title: String,
        price: Number,
      },
    ],

    challenges: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: String,
        price: Number,
      },
    ],

    nutrition: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: String,
        price: Number,
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Completed",
    },

    paymentMethod: {
      type: String,
      default: "card",
    },

    isMembershipPurchase: {
      type: Boolean,
      default: false,
    },

    membershipInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
