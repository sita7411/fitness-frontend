import Order from "../models/Order.js";
import User from "../models/User.js";
import Program from "../models/Program.js";          // ← Add this
import ScheduleEvent from "../models/ScheduleEvent.js"; // ← Add this if you have calendar
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

    const orderItems = [];

    // =============== HANDLE PROGRAMS ===============
    for (const p of programs) {
      const programCustomId = p.id || p._id; // frontend se "id" (string) bhejna better hai
      if (!programCustomId) continue;

      // Find actual program to get correct title, price, days etc.
      const programData = await Program.findOne({ id: programCustomId }).lean();
      if (!programData) {
        console.warn("Program not found:", programCustomId);
        continue;
      }

      orderItems.push({
        title: p.title || programData.title,
        price: Number(p.price) || programData.price || 0,
        type: "program",
        itemId: programData.id, // custom string id
      });
    }

    // =============== HANDLE CLASSES ===============
    classes.forEach((c) => {
      let classId = c._id || c.id;
      if (!classId) return;

      if (typeof classId === "string") {
        classId = new mongoose.Types.ObjectId(classId);
      }

      orderItems.push({
        title: c.title || "Class",
        price: Number(c.price) || 0,
        type: "class",
        itemId: classId,
      });
    });

    // =============== CREATE ORDER ===============
    const newOrder = new Order({
      user: userId,
      userDetails: {
        name: userDetails.name?.trim() || "User",
        email: userDetails.email?.toLowerCase().trim(),
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
      isMembershipPurchase: false,
    });

    await newOrder.save();

    // =============== UPDATE USER ===============
    const user = await User.findById(userId);

    if (!user.purchasedPrograms) user.purchasedPrograms = [];
    if (!user.assignedWorkouts) user.assignedWorkouts = [];
    if (!user.purchasedClasses) user.purchasedClasses = [];
    if (!user.assignedClasses) user.assignedClasses = [];

    // =============== ASSIGN PROGRAMS ===============
    for (const p of programs) {
      const programCustomId = String(p.id || p._id);
      if (!programCustomId) continue;

      const programData = await Program.findOne({ id: programCustomId }).lean();
      if (!programData) continue;

      // Avoid duplicate in purchasedPrograms
      const alreadyPurchased = user.purchasedPrograms.some(
        item => String(item.programId) === programData.id
      );

      if (!alreadyPurchased) {
        user.purchasedPrograms.push({
          programId: programData.id,           // ← String custom id
          title: programData.title,
          trainerName: programData.trainerName || "Trainer",
          purchaseDate: new Date(),
          status: "active",
        });

        // Add to assignedWorkouts (only string IDs)
        if (!user.assignedWorkouts.includes(programData.id)) {
          user.assignedWorkouts.push(programData.id);
        }

        // =============== CREATE SCHEDULE EVENTS (CALENDAR) ===============
        if (programData.days && programData.days.length > 0) {
          const startDate = new Date();
          for (let i = 0; i < programData.days.length; i++) {
            const day = programData.days[i];
            const eventDate = new Date(startDate);
            eventDate.setDate(startDate.getDate() + i);

            const exists = await ScheduleEvent.findOne({
              userId: user._id,
              programId: programData.id,
              date: eventDate.toISOString().split('T')[0],
            });

            if (!exists) {
              await ScheduleEvent.create({
                userId: user._id,
                programId: programData.id,
                title: day.title || `Day ${i + 1} - ${programData.title}`,
                date: eventDate.toISOString().split('T')[0],
                source: "program",
                status: "scheduled",
                completed: false,
              });
            }
          }
        }
      }
    }

    // =============== ASSIGN CLASSES ===============
    for (const cls of classes) {
      let classId = cls._id || cls.id;
      if (!classId) continue;

      if (typeof classId === "string") {
        classId = new mongoose.Types.ObjectId(classId);
      }

      const alreadyPurchased = user.purchasedClasses.some(
        p => p.classId?.toString() === classId.toString()
      );

      if (!alreadyPurchased) {
        user.purchasedClasses.push({
          classId,
          title: cls.title || "Class",
          trainerName: cls.trainerName || "Trainer",
          purchaseDate: new Date(),
          status: "active",
        });

        if (!user.assignedClasses.some(id => id.toString() === classId.toString())) {
          user.assignedClasses.push(classId);
        }

        // Optional: Schedule class event for today
        const today = new Date().toISOString().split('T')[0];
        const exists = await ScheduleEvent.findOne({
          userId: user._id,
          classId,
          date: today,
        });

        if (!exists) {
          await ScheduleEvent.create({
            userId: user._id,
            classId,
            title: cls.title || "Scheduled Class",
            date: today,
            source: "class",
            status: "scheduled",
            completed: false,
          });
        }
      }
    }

    await user.save();

    // =============== CLEAR CART ===============
    await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalAmount: 0, itemCount: 0 }
    );

    res.status(201).json({
      success: true,
      message: "Order placed and access granted successfully!",
      orderId: newOrder._id,
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};