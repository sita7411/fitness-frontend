import Order from "../models/Order.js";
import User from "../models/User.js";
import mongoose from "mongoose";
// CREATE ORDER + ADD TO USER PURCHASED PROGRAMS
export const createOrder = async (req, res) => {
  try {
    const userId = req.user?._id; // FIXED
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      userDetails,
      cardDetails,
      programs = [],
      classes = [],
      total,
    } = req.body;

    if (!userDetails || !cardDetails || !programs || !total) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    const newOrder = new Order({
      userDetails,
      cardDetails,
      programs,
      total,
      status: "Completed",
    });

    await newOrder.save();

    const user = await User.findById(userId);

    programs.forEach((program) => {
      const exists = user.purchasedPrograms?.some(
        (p) => p.programId.toString() === program._id.toString() // FIXED
      );

      if (!exists) {
        user.purchasedPrograms.push({
          programId: program._id, // FIXED
          title: program.title,
          trainerName: program.trainerName,
          purchaseDate: new Date(),
          status: "active",
        });
      }
    });
    // Agar classes bhi alag se purchase hoti hain toh ye use kar
    // सिर्फ ये classes वाला loop बदल दो (बाकी सब वही रहेगा)
    classes.forEach((cls) => {
      // ObjectId बनाओ — चाहे string आए या ObjectId
      const classObjectId =
        typeof cls._id === "string"
          ? new mongoose.Types.ObjectId(cls._id)
          : cls._id;

      // purchasedClasses में ObjectId डालो
      const alreadyPurchased = user.purchasedClasses?.some(
        (p) => p.classId && p.classId.toString() === classObjectId.toString()
      );

      if (!alreadyPurchased) {
        user.purchasedClasses.push({
          classId: classObjectId, // ObjectId only!
          title: cls.title,
          trainerName: cls.trainerName || "Trainer",
          purchaseDate: new Date(),
          status: "active",
        });
      }

      // assignedClasses में भी ObjectId डालो (string नहीं!)
      const alreadyAssigned = user.assignedClasses?.some(
        (id) => id.toString() === classObjectId.toString()
      );

      if (!alreadyAssigned) {
        user.assignedClasses.push(classObjectId); // ObjectId only!
      }
    });
    await user.save();

    res.status(201).json({
      message: "Order placed and programs added successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
