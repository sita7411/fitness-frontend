import nodemailer from "nodemailer";
import Otp from "../models/Otp.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Membership from "../models/Membership.js";
import mongoose from "mongoose";
import Program from "../models/Program.js";
import ScheduleEvent from "../models/ScheduleEvent.js";
import { format, addDays } from "date-fns";
import Cart from "../models/Cart.js";
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

export const verifyOtpAndSaveOrder = async (req, res) => {
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

    // Basic validation
    if (!email || !userDetails || !cardDetails || !total) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate OTP
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp || new Date(otpRecord.expiresIn) < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const loggedInUser = req.user ? await User.findById(req.user._id) : null;
    let membershipInfo = null;
    const orderItems = []; // Always populate this for order history (guest + logged-in)

    // ====================== 1. MEMBERSHIP PURCHASE ======================
    if (membershipId) {
      const membership = await Membership.findById(membershipId);
      if (!membership) {
        return res.status(404).json({ message: "Membership plan not found" });
      }

      const startDate = new Date();
      let monthsToAdd = 1;
      const dur = membership.duration.toLowerCase();
      if (dur.includes("year")) monthsToAdd = 12;
      else if (dur.includes("month")) {
        const match = dur.match(/\d+/);
        monthsToAdd = match ? parseInt(match[0]) : 1;
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
        price: total,
        type: "membership",
        itemId: membership._id,
      });

      // Assign membership + included programs to logged-in user only
      if (loggedInUser) {
        loggedInUser.membership = membershipInfo;
        loggedInUser.markModified("membership");

        // Find all programs allowed by this membership plan
        const includedPrograms = await Program.find({
          plans: { $in: membership.plans },
        });

        // Initialize arrays if missing
        loggedInUser.assignedWorkouts = loggedInUser.assignedWorkouts || [];
        loggedInUser.enrolledPrograms = loggedInUser.enrolledPrograms || [];

        includedPrograms.forEach((prog) => {
          const progId = prog.id; // custom string id

          // Add to dashboard (assignedWorkouts)
          if (!loggedInUser.assignedWorkouts.includes(progId)) {
            loggedInUser.assignedWorkouts.push(progId);
          }

          // Enroll for progress tracking
          if (!loggedInUser.enrolledPrograms.some((e) => e.programId === progId)) {
            loggedInUser.enrolledPrograms.push({
              programId: progId,
              title: prog.title,
              trainerName: prog.trainerName || "Trainer",
              enrolledAt: new Date(),
              progress: 0,
              completedDays: 0,
            });
          }
        });

        await loggedInUser.save();
      }
    }

    // ====================== 2. ADD ALL PURCHASED ITEMS TO ORDER HISTORY ======================
    // This runs for both guest and logged-in users
    for (const p of programs) {
      const progId = p.id || p._id;
      if (progId) {
        const prog = await Program.findOne({ id: progId }).lean();
        orderItems.push({
          title: p.title || prog?.title || "Program",
          price: Number(p.price) || 0,
          type: "program",
          itemId: progId,
        });
      }
    }

    classes.forEach((c) => {
      const classId = c._id || c.id;
      if (classId) {
        orderItems.push({
          title: c.title || "Class",
          price: Number(c.price) || 0,
          type: "class",
          itemId: classId,
        });
      }
    });

    challenges.forEach((ch) => {
      const chId = ch._id || ch.id;
      if (chId) {
        orderItems.push({
          title: ch.title || "Challenge",
          price: Number(ch.price) || 0,
          type: "challenge",
          itemId: chId,
        });
      }
    });

    nutrition.forEach((n) => {
      const nId = n._id || n.id;
      if (nId) {
        orderItems.push({
          title: n.title || "Nutrition Plan",
          price: Number(n.price) || 0,
          type: "nutrition",
          itemId: nId,
        });
      }
    });

    // ====================== 3. ASSIGN REGULAR PURCHASES TO USER (Only if logged-in & not membership) ======================
    if (loggedInUser && !membershipId) {
      // Initialize all arrays safely
      const init = (path, defaultVal = []) => {
        if (!loggedInUser.get(path)) loggedInUser.set(path, defaultVal);
      };
      init("purchasedPrograms");
      init("assignedWorkouts");
      init("purchasedClasses");
      init("assignedClasses");
      init("purchasedChallenges");
      init("assignedChallenges");
      init("purchasedNutritionPlans");
      init("assignedNutritionPlans");

      // === PROGRAMS ===
      for (const p of programs) {
        const progId = String(p.id || p._id);
        if (!progId) continue;

        const programData = await Program.findOne({ id: progId }).lean();
        if (!programData) continue;

        const alreadyPurchased = loggedInUser.purchasedPrograms.some(
          (item) => String(item.programId) === progId
        );

        if (!alreadyPurchased) {
          loggedInUser.purchasedPrograms.push({
            programId: progId,
            title: programData.title,
            trainerName: programData.trainerName || "Trainer",
            purchaseDate: new Date(),
            status: "active",
          });

          if (!loggedInUser.assignedWorkouts.includes(progId)) {
            loggedInUser.assignedWorkouts.push(progId);
          }

          // Create Schedule Events for program days
          if (programData.days && programData.days.length > 0) {
            const startDate = new Date();
            for (let i = 0; i < programData.days.length; i++) {
              const day = programData.days[i];
              const eventDate = format(addDays(startDate, i), "yyyy-MM-dd");

              const exists = await ScheduleEvent.findOne({
                userId: loggedInUser._id,
                programId: progId,
                date: eventDate,
              });

              if (!exists) {
                await ScheduleEvent.create({
                  userId: loggedInUser._id,
                  programId: progId,
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

      // === CLASSES ===
      for (const c of classes) {
        let classId = c._id || c.id;
        if (!classId) continue;

        if (typeof classId === "string") {
          classId = new mongoose.Types.ObjectId(classId);
        }

        const alreadyPurchased = loggedInUser.purchasedClasses.some(
          (item) => item.classId?.toString() === classId.toString()
        );

        if (!alreadyPurchased) {
          loggedInUser.purchasedClasses.push({
            classId,
            title: c.title || "Class",
            trainerName: c.trainerName || "Trainer",
            purchaseDate: new Date(),
            status: "active",
          });

          if (!loggedInUser.assignedClasses.some((id) => id.toString() === classId.toString())) {
            loggedInUser.assignedClasses.push(classId);
          }

          // Optional: Schedule class event for today
          const today = format(new Date(), "yyyy-MM-dd");
          const exists = await ScheduleEvent.findOne({
            userId: loggedInUser._id,
            classId,
            date: today,
          });

          if (!exists) {
            await ScheduleEvent.create({
              userId: loggedInUser._id,
              classId,
              title: c.title || "Scheduled Class",
              date: today,
              source: "class",
              status: "scheduled",
              completed: false,
            });
          }
        }
      }

      // === CHALLENGES ===
      for (const ch of challenges) {
        let challengeId = ch._id || ch.id;
        if (!challengeId) continue;

        if (typeof challengeId === "string") {
          challengeId = new mongoose.Types.ObjectId(challengeId);
        }

        const alreadyPurchased = loggedInUser.purchasedChallenges.some(
          (item) => item.challengeId?.toString() === challengeId.toString()
        );

        if (!alreadyPurchased) {
          loggedInUser.purchasedChallenges.push({
            challengeId,
            title: ch.title || "Challenge",
            trainerName: ch.trainerName || "Trainer",
            purchaseDate: new Date(),
            status: "active",
          });

          if (!loggedInUser.assignedChallenges.some((id) => id.toString() === challengeId.toString())) {
            loggedInUser.assignedChallenges.push(challengeId);
          }

          const today = format(new Date(), "yyyy-MM-dd");
          const exists = await ScheduleEvent.findOne({
            userId: loggedInUser._id,
            challengeId,
            date: today,
          });

          if (!exists) {
            await ScheduleEvent.create({
              userId: loggedInUser._id,
              challengeId,
              title: ch.title || "Scheduled Challenge",
              date: today,
              source: "challenge",
              status: "scheduled",
              completed: false,
            });
          }
        }
      }

      // === NUTRITION PLANS ===
      for (const n of nutrition) {
        let planId = n._id || n.id;
        if (!planId) continue;

        if (typeof planId === "string") {
          planId = new mongoose.Types.ObjectId(planId);
        }

        const alreadyPurchased = loggedInUser.purchasedNutritionPlans.some(
          (item) => item.planId?.toString() === planId.toString()
        );

        if (!alreadyPurchased) {
          loggedInUser.purchasedNutritionPlans.push({
            planId,
            title: n.title || "Nutrition Plan",
            trainerName: n.trainerName || "Nutritionist",
            purchaseDate: new Date(),
            status: "active",
          });

          if (!loggedInUser.assignedNutritionPlans.some((id) => id.toString() === planId.toString())) {
            loggedInUser.assignedNutritionPlans.push(planId);
          }
        }
      }

      await loggedInUser.save();
    }

    // ====================== 4. CREATE FINAL ORDER ======================
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
        : [{ title: "Custom Purchase", price: total, type: "program" }],
      total,
      status: "Completed",
      paymentMethod: "card",
      isMembershipPurchase: !!membershipId,
      membershipInfo: membershipInfo || null,
    });

    // Clear cart if user was logged in
    if (loggedInUser) {
      await Cart.findOneAndUpdate(
        { userId: loggedInUser._id },
        { items: [], totalAmount: 0, itemCount: 0 }
      );
    }

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(201).json({
      success: true,
      message: membershipId
        ? "Membership activated successfully!"
        : programs.length > 0
        ? "Program purchased successfully!"
        : classes.length > 0
        ? "Class purchased successfully!"
        : challenges.length > 0
        ? "Challenge purchased successfully!"
        : nutrition.length > 0
        ? "Nutrition plan purchased successfully!"
        : "Purchase completed successfully!",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Purchase Error:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};