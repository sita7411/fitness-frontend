import Order from "../models/Order.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      userDetails,
      cardDetails,
      programs = [],
      classes = [],
      total,
    } = req.body;

    if (!userDetails || !cardDetails || (!programs.length && !classes.length) || !total) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    // Unified order items for new schema
    const orderItems = [];

    // Handle programs
    programs.forEach((p) => {
      orderItems.push({
        title: p.title,
        price: p.price || total, // fallback if price not sent
        type: "program",
        itemId: programData.id,
      });
    });

    // Handle classes
    classes.forEach((c) => {
      orderItems.push({
        title: c.title,
        price: c.price || 0,
        type: "class",
        itemId: c._id,
      });
    });

    const newOrder = new Order({
      user: userId,
      userDetails: {
        name: userDetails.name?.trim() || "User",
        email: userDetails.email,
        phone: userDetails.phone || "",
        address: userDetails.address || "",
        city: userDetails.city || "",
        country: userDetails.country || "",
      },
      cardDetails: {
        last4: cardDetails.cardNumber?.slice(-4) || "0000",
        nameOnCard: cardDetails.nameOnCard || "",
        expiry: cardDetails.expiry || "XX/XX",
      },
      programs: orderItems.length > 0 ? orderItems : [{ title: "Purchase", price: total, type: "program" }],
      total,
      status: "Completed",
      paymentMethod: "card",
      isMembershipPurchase: false, // unless membership
    });

    await newOrder.save();

    const user = await User.findById(userId);

    // Programs assign
    programs.forEach((program) => {
      const exists = user.purchasedPrograms?.some(
        (p) => p.programId?.toString() === program._id?.toString()
      );
      if (!exists) {
        user.purchasedPrograms.push({
          programId: program._id,
          title: program.title,
          trainerName: program.trainerName || "Trainer",
          purchaseDate: new Date(),
          status: "active",
        });
        if (!user.assignedWorkouts.some(id => id.toString() === program._id.toString())) {
          user.assignedWorkouts.push(program._id);
        }
      }
    });

    // Classes assign
    classes.forEach((cls) => {
      let classId = cls._id;
      if (typeof classId === "string") {
        classId = new mongoose.Types.ObjectId(classId);
      }

      const alreadyPurchased = user.purchasedClasses?.some(
        (p) => p.classId?.toString() === classId.toString()
      );

      if (!alreadyPurchased) {
        user.purchasedClasses.push({
          classId,
          title: cls.title,
          trainerName: cls.trainerName || "Trainer",
          purchaseDate: new Date(),
          status: "active",
        });
      }

      if (!user.assignedClasses?.some(id => id.toString() === classId.toString())) {
        user.assignedClasses.push(classId);
      }
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Order placed and items added successfully!",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};