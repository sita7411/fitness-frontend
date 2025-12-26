import nodemailer from "nodemailer";
import Otp from "../models/Otp.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Membership from "../models/Membership.js";
import mongoose from "mongoose";
import Program from "../models/Program.js";
import ScheduleEvent from "../models/ScheduleEvent.js";
import Cart from "../models/Cart.js";

import { format, addDays } from "date-fns";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// ====================== SEND OTP ======================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const normalizedEmail = email.toLowerCase().trim();

    await Otp.deleteMany({ email: normalizedEmail });

    await Otp.create({
      email: normalizedEmail,
      otp,
      expiresIn: new Date(Date.now() + 10 * 60 * 1000),
    });

    await transporter.sendMail({
      from: `"FitTrack Health" <${process.env.EMAIL}>`,
      to: normalizedEmail,
      subject: "Your OTP Code - FitTrack Health",
      text: `Your verification code is ${otp}. Valid for 10 minutes.`,
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; text-align: center; background: #f9f9f9;">
              <h2 style="color: #E3002A;">FitTrack Health</h2>
              <h1 style="font-size: 42px; letter-spacing: 10px; color: #E3002A; margin: 20px 0;">${otp}</h1>
              <p style="color: #555; font-size: 16px;">Your verification code</p>
              <p style="color: #888; font-size: 14px;">Expires in <strong>10 minutes</strong></p>
              <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
              <p style="color: #999; font-size: 12px;">© 2025 FitLife Pro. All rights reserved.</p>
            </div>
          `,
    });

    return res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ message: "Failed to send OTP. Try again." });
  }
};

// ====================== VERIFY OTP + PROCESS PAYMENT (FINAL FIXED VERSION) ======================
export const verifyOtpAndSaveOrder = async (req, res) => {
  console.log("=== verifyOtpAndSaveOrder HIT ===");
  console.log("req.body:", req.body);

  try {
    const {
      email: rawEmail,
      otp,
      userDetails,
      cardDetails,
      programs = [],
      classes = [],
      challenges = [],
      nutrition = [],
      total,
      membershipId,
    } = req.body;

    const email = rawEmail?.toLowerCase().trim();

    // Prevent duplicate titles between programs and classes
    const allTitles = [
      ...programs.map(p => p.title?.toLowerCase() || ""),
      ...classes.map(c => c.title?.toLowerCase() || ""),
    ];
    if (new Set(allTitles).size !== allTitles.length) {
      return res.status(400).json({ message: "Duplicate items not allowed!" });
    }

    // Validate OTP
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp || new Date(otpRecord.expiresIn) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const loggedInUser = req.user ? await User.findById(req.user.id) : null;
    let membershipInfo = null;
    const orderItems = [];

    // 1. MEMBERSHIP PURCHASE (Optional - can be combined with other items)
    if (membershipId) {
      const membership = await Membership.findById(membershipId);
      if (!membership) return res.status(404).json({ message: "Membership plan not found" });

      const startDate = new Date();
      let monthsToAdd = 1;
      const durationStr = membership.duration.toLowerCase();
      if (durationStr.includes("year")) monthsToAdd = 12;
      else if (durationStr.includes("month")) {
        const match = durationStr.match(/(\d+)\s*month/);
        monthsToAdd = match ? parseInt(match[1]) || 1 : 1;
      }
      const expiresAt = new Date(startDate);
      expiresAt.setMonth(startDate.getMonth() + monthsToAdd);

      membershipInfo = {
        _id: membership._id,
        plan: membership.name,
        price: membership.price,
        duration: membership.duration,
        features: membership.features,
        startedAt: startDate,
        expiresAt,
        isActive: true,
      };

      // Add membership to order items
      orderItems.push({
        title: `${membership.name} Membership`,
        price: membership.price,  // Actual membership price
        type: "membership",
        itemId: membership._id.toString(),
      });

      // Assign membership to logged-in user
      if (loggedInUser) {
        loggedInUser.membership = membershipInfo;
        loggedInUser.markModified("membership");

        const matchingPrograms = await Program.find({ plans: { $in: membership.plans } });

        // Assign access to programs included in membership
        matchingPrograms.forEach(p => {
          if (!loggedInUser.assignedWorkouts.some(id => id.toString() === p._id.toString())) {
            loggedInUser.assignedWorkouts.push(p._id);
          }
        });

        matchingPrograms.forEach(program => {
          const exists = loggedInUser.enrolledPrograms.some(e => e.programId.toString() === program._id.toString());
          if (!exists) {
            loggedInUser.enrolledPrograms.push({
              programId: program._id,
              title: program.title,
              trainerName: program.trainerName || "Trainer",
              enrolledAt: new Date(),
              progress: 0,
              completedDays: 0,
            });
          }
        });

        await loggedInUser.save();
      }
    }

    // 2. ADDITIONAL ITEMS: Programs, Classes, Challenges, Nutrition
    // Always process these — even if membership is purchased
    if (loggedInUser) {
      loggedInUser.purchasedPrograms ??= [];
      loggedInUser.assignedWorkouts ??= [];
      loggedInUser.purchasedClasses ??= [];
      loggedInUser.purchasedChallenges ??= [];
      loggedInUser.purchasedNutritionPlans ??= [];
      loggedInUser.assignedNutritionPlans ??= [];
    }

    // Programs
    if (programs.length > 0) {
      for (const p of programs) {
        const programCustomId = String(p.id)?.trim();
        if (!programCustomId) continue;

        const programData = await Program.findOne({ id: programCustomId }).lean();
        if (!programData || !programData.days || programData.days.length === 0) continue;

        orderItems.push({
          title: p.title || programData.title,
          price: Number(p.price) || 0,
          type: "program",
          itemId: programData.id,
        });

        if (loggedInUser) {
          const alreadyPurchased = loggedInUser.purchasedPrograms.some(item => String(item.programId) === programData.id);
          if (!alreadyPurchased) {
            loggedInUser.purchasedPrograms.push({
              programId: programData.id,
              title: programData.title,
              trainerName: programData.trainerName || "Trainer",
              purchaseDate: new Date(),
              status: "active",
            });
            if (!loggedInUser.assignedWorkouts.includes(programData.id)) {
              loggedInUser.assignedWorkouts.push(programData.id);
            }
          }

          // Schedule events
          const startDate = new Date();
          for (let i = 0; i < programData.days.length; i++) {
            const day = programData.days[i];
            const eventDate = format(addDays(startDate, i), "yyyy-MM-dd");
            const exists = await ScheduleEvent.findOne({
              userId: loggedInUser._id,
              programId: programData.id,
              date: eventDate,
            });
            if (!exists) {
              await ScheduleEvent.create({
                userId: loggedInUser._id,
                programId: programData.id,
                title: day.title || `Day ${i + 1} - ${programData.title}`,
                date: eventDate,
                source: "program",
                status: "scheduled",
                completed: false,
              });
            }
          }
        }
      }
    }

    // Classes
    if (classes.length > 0) {
      for (const c of classes) {
        const rawId = c._id || c.id;
        if (!rawId) continue;

        let classObjectId;
        try { classObjectId = new mongoose.Types.ObjectId(rawId); } catch { continue; }

        orderItems.push({
          title: c.title || "Untitled Class",
          price: Number(c.price) || 0,
          type: "class",
          itemId: rawId,
        });

        if (loggedInUser) {
          const alreadyPurchased = loggedInUser.purchasedClasses.some(item => item.classId?.toString() === classObjectId.toString());
          if (!alreadyPurchased) {
            loggedInUser.purchasedClasses.push({
              classId: classObjectId,
              title: c.title || "Untitled Class",
              trainerName: c.trainerName || "Trainer",
              purchaseDate: new Date(),
              status: "active",
            });
          }

          const exists = await ScheduleEvent.findOne({
            userId: loggedInUser._id,
            classId: classObjectId,
            date: format(new Date(), "yyyy-MM-dd"),
          });
          if (!exists) {
            await ScheduleEvent.create({
              userId: loggedInUser._id,
              classId: classObjectId,
              title: c.title || "Scheduled Class",
              date: format(new Date(), "yyyy-MM-dd"),
              source: "class",
              status: "scheduled",
              completed: false,
            });
          }
        }
      }
    }

    // Challenges
    if (challenges.length > 0) {
      for (const ch of challenges) {
        const rawId = ch._id || ch.id;
        if (!rawId) continue;

        let challengeObjectId;
        try { challengeObjectId = new mongoose.Types.ObjectId(rawId); } catch { continue; }

        orderItems.push({
          title: ch.title || "Untitled Challenge",
          price: Number(ch.price) || 0,
          type: "challenge",
          itemId: rawId,
        });

        if (loggedInUser) {
          const alreadyPurchased = loggedInUser.purchasedChallenges?.some(p => p.challengeId?.toString() === challengeObjectId.toString());
          if (!alreadyPurchased) {
            loggedInUser.purchasedChallenges.push({
              challengeId: challengeObjectId,
              title: ch.title || "Untitled Challenge",
              trainerName: ch.trainerName || "Trainer",
              purchaseDate: new Date(),
              status: "active",
            });
          }

          const exists = await ScheduleEvent.findOne({
            userId: loggedInUser._id,
            challengeId: challengeObjectId,
            date: format(new Date(), "yyyy-MM-dd"),
          });
          if (!exists) {
            await ScheduleEvent.create({
              userId: loggedInUser._id,
              challengeId: challengeObjectId,
              title: ch.title || "Scheduled Challenge",
              date: format(new Date(), "yyyy-MM-dd"),
              source: "challenge",
              status: "scheduled",
              completed: false,
            });
          }
        }
      }
    }

    // Nutrition Plans
    if (nutrition.length > 0) {
      if (loggedInUser) {
        loggedInUser.purchasedNutritionPlans ??= [];
        loggedInUser.assignedNutritionPlans ??= [];
      }

      for (const n of nutrition) {
        const rawId = n._id || n.id;
        if (!rawId) continue;

        let planObjectId;
        try { planObjectId = new mongoose.Types.ObjectId(rawId); } catch { continue; }

        orderItems.push({
          title: n.title || "Nutrition Plan",
          price: Number(n.price) || 0,
          type: "nutrition",
          itemId: rawId,
        });

        if (loggedInUser) {
          const alreadyPurchased = loggedInUser.purchasedNutritionPlans.some(item => item.planId?.toString() === planObjectId.toString());
          if (!alreadyPurchased) {
            loggedInUser.purchasedNutritionPlans.push({
              planId: planObjectId,
              title: n.title || "Nutrition Plan",
              trainerName: n.trainerName || "Nutritionist",
              purchaseDate: new Date(),
              status: "active",
            });
            loggedInUser.assignedNutritionPlans.push(planObjectId);
          }
        }
      }
    }

    // Save user updates if logged in
    if (loggedInUser) {
      await loggedInUser.save();
    }

    // 3. CREATE ORDER
    const order = await Order.create({
      user: loggedInUser?._id || null,
      guestEmail: loggedInUser ? null : email,
      isAnonymous: !loggedInUser,
      userDetails: {
        name: userDetails.name?.trim() || "Guest",
        email,
        phone: userDetails.phone || "",
        address: userDetails.address || "",
        city: userDetails.city || "",
        country: userDetails.country || "",
      },
      cardDetails: {
        last4: cardDetails.cardNumber?.slice(-4) || "0000",
        nameOnCard: cardDetails.nameOnCard || "Guest",
        expiry: cardDetails.expiry || "XX/XX",
      },
      programs: orderItems.length > 0
        ? orderItems
        : [{ title: "Purchase", price: total, type: "program" }],
      total,
      status: "Completed",
      paymentMethod: "card",
      isMembershipPurchase: !!membershipId,
      membershipInfo,
    });

    // Clear cart
    if (loggedInUser) {
      await Cart.findOneAndUpdate(
        { userId: loggedInUser._id },
        { items: [], totalAmount: 0, itemCount: 0 },
        { new: true }
      );
    }

    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(201).json({
      success: true,
      message: "Purchase completed successfully! Check your dashboard.",
      orderId: order._id,
    });

  } catch (error) {
    console.error("Purchase Error:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};