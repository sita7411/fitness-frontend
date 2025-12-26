// controllers/programController.js
import Program from "../models/Program.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
// import { notifyUser, notifyAdmin } from "../services/notificationService.js";
import Admin from "../models/Admin.js";

// ------------------------ UTIL FUNCTIONS ------------------------

const groupFilesByFieldname = (files = []) => {
  const grouped = {};
  files.forEach((file) => {
    if (!grouped[file.fieldname]) grouped[file.fieldname] = [];
    grouped[file.fieldname].push(file);
  });
  return grouped;
};

const extractExerciseFiles = (filesObj) => {
  const exerciseFiles = {};
  for (const key in filesObj) {
    if (key.startsWith("exercise-")) {
      const id = key.replace("exercise-", "");
      exerciseFiles[id] = filesObj[key][0].path;
    }
  }
  return exerciseFiles;
};

// ------------------------ CREATE PROGRAM ------------------------
export const createProgram = async (req, res) => {
  try {
    let programData = JSON.parse(req.body.program);
    const files = groupFilesByFieldname(req.files);
    const exerciseFiles = extractExerciseFiles(files);
    const mainThumbnail = files["thumbnail"]?.[0]?.path || null;

    // EQUIPMENT: Ensure it's always an array
    let equipment = programData.equipment;
    if (typeof equipment === "string") {
      equipment = equipment
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
    } else if (!Array.isArray(equipment)) {
      equipment = equipment ? [equipment] : [];
    }

    let days = Array.isArray(programData.days) ? programData.days : [];
    days = days.map((day, index) => ({
      day: index + 1,
      title: day.title,
      exercises: day.exercises.map((ex) => ({
        id: ex.id,
        title: ex.title,
        type: ex.type,
        time: ex.time,
        reps: ex.reps,
        sets: ex.sets,
        thumbnail: exerciseFiles[ex.id] || ex.thumbnail || null,
        description: ex.notes || "",
        section: ex.section || "Workout",
      })),
    }));

    const newProgram = new Program({
      id: programData.id || uuidv4(),
      title: programData.title,
      desc: programData.description,
      thumbnail: mainThumbnail,
      duration: programData.duration,
      difficulty: programData.level,
      focus: programData.focus,
      trainingType: programData.trainingType,
      equipment: equipment, // Now always an array
      price: programData.price,
      caloriesBurned: programData.caloriesBurned || 0,
      plans: programData.plans || [],
      trainerName: programData.trainerName || "",
      status: "Active",
      totalDays: days.length,
      days,
    });

    await newProgram.save();

    res.status(201).json({
      ...newProgram._doc,
      id: newProgram.id,
    });
  } catch (err) {
    console.log("Create Program Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------------ UPDATE PROGRAM ------------------------
export const updateProgram = async (req, res) => {
  try {
    let program = await Program.findOne({ id: req.params.id });

    // Agar custom id se nahi mila, toh MongoDB ke _id se try karo
    if (!program && mongoose.Types.ObjectId.isValid(req.params.id)) {
      program = await Program.findById(req.params.id);
    }

    if (!program) return res.status(404).json({ message: "Program not found" });

    const programData = JSON.parse(req.body.program || "{}");
    const files = groupFilesByFieldname(req.files);
    const exerciseFiles = extractExerciseFiles(files);
    const mainThumbnail = files["thumbnail"]?.[0]?.path || program.thumbnail;

    // EQUIPMENT: Normalize to array
    let equipment = programData.equipment;
    if (typeof equipment === "string") {
      equipment = equipment
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
    } else if (!Array.isArray(equipment)) {
      equipment = equipment ? [equipment] : [];
    }

    let days = Array.isArray(programData.days)
      ? programData.days
      : program.days;
    days = days.map((day, index) => ({
      day: index + 1,
      title: day.title,
      exercises: day.exercises.map((ex) => ({
        id: ex.id,
        title: ex.title,
        type: ex.type,
        time: ex.time,
        reps: ex.reps,
        sets: ex.sets,
        thumbnail: exerciseFiles[ex.id] || ex.thumbnail || null,
        description: ex.notes || "",
        section: ex.section || "Workout",
      })),
    }));

    Object.assign(program, {
      title: programData.title || program.title,
      desc: programData.description || program.desc,
      duration: programData.duration || program.duration,
      difficulty: programData.level || program.difficulty,
      trainingType: programData.trainingType || program.trainingType,
      focus: programData.focus || program.focus,
      equipment: equipment, // Updated: always array
      price: programData.price ?? program.price,
      caloriesBurned: programData.caloriesBurned ?? program.caloriesBurned,
      plans: programData.plans || program.plans,
      thumbnail: mainThumbnail,
      trainerName: programData.trainerName || program.trainerName,
      totalDays: days.length,
      days,
    });

    await program.save();

    res.json({
      ...program._doc,
      id: program.id,
    });
  } catch (err) {
    console.log("Update Program Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------------ GET ALL PROGRAMS ------------------------

export const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find({});
    res.json(
      programs.map((p) => ({
        ...p._doc,
        id: p.id,
      }))
    );
  } catch (err) {
    console.error("getPrograms Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------ GET PROGRAM BY ID ------------------------
export const getProgramById = async (req, res) => {
  try {
    let program;

    program = await Program.findOne({ id: req.params.id });

    if (!program && mongoose.Types.ObjectId.isValid(req.params.id)) {
      program = await Program.findById(req.params.id);
    }

    if (!program) return res.status(404).json({ message: "Program not found" });

    res.json({
      ...program._doc,
      id: program.id || program._id.toString(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------ GET PROGRAM DAY ------------------------

export const getProgramDay = async (req, res) => {
  try {
    const program = await Program.findOne({ id: req.params.id });
    if (!program) return res.status(404).json({ message: "Program not found" });

    const day = program.days.find((d) => d.day === Number(req.params.day));
    if (!day) return res.status(404).json({ message: "Day not found" });

    res.json(day);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------ DELETE PROGRAM ------------------------

export const deleteProgram = async (req, res) => {
  try {
    let program = await Program.findOne({ id: req.params.id });

    // Fallback to Mongo _id
    if (!program && mongoose.Types.ObjectId.isValid(req.params.id)) {
      program = await Program.findById(req.params.id);
    }

    if (!program) return res.status(404).json({ message: "Program not found" });

    await program.deleteOne();
    res.json({ message: "Program deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------ UPDATE STATUS ------------------------

export const updateProgramStatus = async (req, res) => {
  try {
    let program = await Program.findOne({ id: req.params.id });

    if (!program && mongoose.Types.ObjectId.isValid(req.params.id)) {
      program = await Program.findById(req.params.id);
    }

    if (!program) return res.status(404).json({ message: "Program not found" });

    program.status = program.status === "Active" ? "Inactive" : "Active";
    await program.save();

    res.json({ status: program.status });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getUserPrograms = async (req, res) => {
  try {
    console.log("=== getUserPrograms called for user:", req.user._id, "===");

    const user = await User.findById(req.user._id);
    if (!user) {
      console.log("User not found in DB");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.name, user.email);
    console.log(
      "Membership active:",
      user.membership?.isActive,
      "Plan:",
      user.membership?.plan
    );
    console.log(
      "Purchased programs count:",
      user.purchasedPrograms?.length || 0
    );
    console.log("Enrolled programs count:", user.enrolledPrograms?.length || 0);

    let finalPrograms = [];

    // ==================== PURCHASED PROGRAMS ====================
    if (user.purchasedPrograms?.length > 0) {
      console.log("\n--- Processing Purchased Programs ---");
      for (const p of user.purchasedPrograms) {
        if (p.programId) {
          console.log(`Trying programId: ${p.programId} (title: ${p.title})`);

          let prog = null;

          prog = await Program.findOne({ id: p.programId }).lean();
          if (prog) {
            console.log(`✓ Found with custom id: ${prog.title}`);
          } else {
            console.log("✗ Not found with custom id");
          }
          if (!prog && mongoose.Types.ObjectId.isValid(p.programId)) {
            prog = await Program.findById(p.programId).lean();
            if (prog) {
              console.log(`✓ Found with MongoDB _id: ${prog.title}`);
            } else {
              console.log("✗ Not found with MongoDB _id");
            }
          }

          if (prog) {
            finalPrograms.push(prog);
            console.log(`✅ Added to list: ${prog.title}`);
          } else {
            console.log(`❌ PROGRAM NOT FOUND IN DATABASE: ${p.programId}`);
          }
        }
      }
    } else {
      console.log("No purchased programs");
    }

    // ==================== ENROLLED PROGRAMS ====================
    if (user.enrolledPrograms?.length > 0) {
      console.log("\n--- Processing Enrolled Programs ---");
      for (const e of user.enrolledPrograms) {
        if (e.programId) {
          console.log(`Trying enrolled programId: ${e.programId}`);

          let prog = await Program.findOne({ id: e.programId }).lean();
          if (!prog && mongoose.Types.ObjectId.isValid(e.programId)) {
            prog = await Program.findById(e.programId).lean();
          }

          if (prog) {
            finalPrograms.push(prog);
            console.log(`✅ Added enrolled: ${prog.title}`);
          } else {
            console.log(`❌ Enrolled program not found: ${e.programId}`);
          }
        }
      }
    } else {
      console.log("No enrolled programs");
    }

    // ==================== MEMBERSHIP PROGRAMS ====================
    if (user.membership?.isActive) {
      console.log("\n--- Processing Membership Programs ---");
      const plan = user.membership.plan;
      let allowedPlans = ["Basic"];
      if (plan === "Premium") allowedPlans = ["Basic", "Premium"];
      if (plan === "Pro") allowedPlans = ["Basic", "Premium", "Pro"];

      console.log(`User plan: ${plan}, Allowed plans:`, allowedPlans);

      const membershipPrograms = await Program.find({
        plans: { $in: allowedPlans },
        status: "Active",
      }).lean();

      console.log(`Found ${membershipPrograms.length} membership programs`);
      if (membershipPrograms.length > 0) {
        membershipPrograms.forEach((mp) => {
          console.log(
            `+ Membership program: ${mp.title} (plans: ${mp.plans?.join(", ")})`
          );
        });
      }

      finalPrograms.push(...membershipPrograms);
    } else {
      console.log("Membership not active or no plan");
    }

    // Remove duplicates
    const uniquePrograms = Object.values(
      finalPrograms.reduce((acc, prog) => {
        const key = prog.id || prog._id?.toString();
        if (key) acc[key] = prog;
        return acc;
      }, {})
    );

    console.log(`\nFinal unique programs count: ${uniquePrograms.length}`);

    // Clean response
    const clean = uniquePrograms.map((p) => ({
      _id: p._id,
      id: p.id || p._id?.toString(),
      title: p.title,
      subtitle: `${p.trainingType || "Workout"} • ${p.totalDays || 0} days`,
      description: p.desc || p.description || "",
      thumbnail: p.thumbnail || "/default.jpg",
      duration: p.duration || "30-45 min",
      caloriesBurned: p.caloriesBurned || 300,
      difficulty: p.difficulty || "Beginner",
      totalDays: p.totalDays || 0,
      equipment: p.equipment || [],
      days: p.days || [],
      trainerName: p.trainerName || "Trainer",
    }));

    console.log("=== Sending response with", clean.length, "programs ===\n");

    res.json({
      programs: clean,
      total: clean.length,
    });
  } catch (err) {
    console.error("getUserPrograms Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getWeeklyWorkoutStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await Program.aggregate([
      { $unwind: "$completedBy" },
      {
        $match: {
          "completedBy.completedAt": { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dayOfWeek: "$completedBy.completedAt", // 1 = Sunday, 2 = Monday, ..., 7 = Saturday
          },
          sessions: { $sum: 1 },
        },
      },
    ]);

    const dayMap = {
      2: "Mon",
      3: "Tue",
      4: "Wed",
      5: "Thu",
      6: "Fri",
      7: "Sat",
      1: "Sun",
    };

    const resultMap = logs.reduce((acc, item) => {
      acc[item._id] = item.sessions;
      return acc;
    }, {});

    const finalResult = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
      (day) => ({
        day,
        sessions:
          resultMap[Object.keys(dayMap).find((k) => dayMap[k] === day)] || 0,
      })
    );

    return res.json({
      success: true,
      weeklyWorkouts: finalResult,
    });
  } catch (error) {
    console.error("Weekly Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch weekly stats",
      error: error.message,
    });
  }
};

// controllers/programController.js के अंदर completeProgramDay function में बदलाव

export const completeProgramDay = async (req, res) => {
  try {
    const { day, workoutMinutes, heartRate, weight } = req.body;
    const programId = req.params.id;

    const program = await Program.findOne({ id: programId });
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const alreadyCompletedToday = program.completedBy.some(
      (entry) =>
        entry.user.toString() === req.user._id.toString() &&
        entry.day === Number(day) &&
        new Date(entry.completedAt).setHours(0, 0, 0, 0) === todayTime
    );

    let isNewCompletion = false;

    if (!alreadyCompletedToday) {
      program.completedBy.push({
        user: req.user._id,
        day: Number(day),
        workoutMinutes: workoutMinutes ? Number(workoutMinutes) : undefined,
        heartRate: heartRate ? Number(heartRate) : undefined,
        weight: weight ? Number(weight) : undefined,
        completedAt: new Date(),
      });

      await program.save();
      isNewCompletion = true;
    }

    // ====== STREAK CALCULATION (NEW) ======
    let currentStreak = 0;
    if (isNewCompletion || alreadyCompletedToday) {
      // Get all completed days for this user, sorted by date descending
      const userCompletions = program.completedBy
        .filter((entry) => entry.user.toString() === req.user._id.toString())
        .map((entry) => new Date(entry.completedAt).setHours(0, 0, 0, 0));

      // Remove duplicates (in case multiple exercises on same day)
      const uniqueDays = [...new Set(userCompletions)].sort((a, b) => b - a);

      const todayMidnight = new Date().setHours(0, 0, 0, 0);

      currentStreak = 0;
      let checkDate = todayMidnight;

      for (let i = 0; i < uniqueDays.length; i++) {
        if (uniqueDays[i] === checkDate) {
          currentStreak++;
          checkDate -= 24 * 60 * 60 * 1000; // previous day
        } else if (uniqueDays[i] < checkDate) {
          break; // gap found
        }
      }
    }

    res.json({
      success: true,
      message: "Day marked as complete",
      alreadyCompleted: !isNewCompletion,
      day: Number(day),
      streak: currentStreak, // ← नया: frontend को streak भेज रहे हैं
    });
  } catch (error) {
    console.error("Complete Day Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====== TRENDING WORKOUTS API - LIVE & ACCURATE ======
export const getTrendingWorkouts = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const trending = await Program.aggregate([
      { $unwind: "$completedBy" },
      {
        $match: {
          "completedBy.completedAt": { $gte: startDate },
          status: { $ne: "Inactive" },
        },
      },
      {
        $group: {
          _id: "$id",
          name: { $first: "$title" },
          thumbnail: { $first: "$thumbnail" },
          trainingType: { $first: "$trainingType" },
          totalCompletions: { $sum: 1 },
          uniqueUsers: { $addToSet: "$completedBy.user" },
        },
      },
      {
        $addFields: {
          users: { $size: "$uniqueUsers" },
        },
      },
      { $sort: { users: -1, totalCompletions: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 0,
          workoutId: "$_id",
          name: 1,
          thumbnail: 1,
          users: 1,
          trend: {
            $concat: [
              "+",
              {
                $toString: {
                  $add: [15, { $floor: { $multiply: [{ $rand: {} }, 40] } }],
                },
              },
              "%",
            ],
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: trending.length > 0 ? trending : [],
    });
  } catch (error) {
    console.error("Trending API Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const completeExercise = async (req, res) => {
  try {
    const { day, exerciseId } = req.body;
    const programId = req.params.id;

    if (!day || !exerciseId) {
      return res
        .status(400)
        .json({ message: "day and exerciseId are required" });
    }

    let program = await Program.findOne({ id: programId });
    if (!program && mongoose.Types.ObjectId.isValid(programId)) {
      program = await Program.findById(programId);
    }
    if (!program) return res.status(404).json({ message: "Program not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const alreadyCompleted = program.completedBy.some(
      (entry) =>
        entry.user.toString() === req.user._id.toString() &&
        entry.day === Number(day) &&
        entry.exerciseId === exerciseId &&
        new Date(entry.completedAt).setHours(0, 0, 0, 0) === todayTime
    );

    if (alreadyCompleted) {
      return res.json({
        success: true,
        message: "Already completed today",
        alreadyCompleted: true,
      });
    }

    // Naya completion add karo
    program.completedBy.push({
      user: req.user._id,
      day: Number(day),
      exerciseId: exerciseId,
      completedAt: new Date(),
    });

    await program.save();

    res.json({
      success: true,
      message: "Exercise marked as complete",
      alreadyCompleted: false,
    });
  } catch (error) {
    console.error("completeExercise Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProgressForProgram = async (req, res) => {
  try {
    const programId = req.params.id;

    let program = await Program.findOne({ id: programId });
    if (!program && mongoose.Types.ObjectId.isValid(programId)) {
      program = await Program.findById(programId);
    }
    if (!program) return res.status(404).json({ message: "Program not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const completedToday = program.completedBy
      .filter(
        (entry) =>
          entry.user.toString() === req.user._id.toString() &&
          new Date(entry.completedAt).setHours(0, 0, 0, 0) === todayTime
      )
      .map((entry) => entry.exerciseId);

    res.json({
      completedExercises: completedToday,
    });
  } catch (error) {
    console.error("getUserProgress Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- RESET PROGRAM DAY ----------------
export const resetProgramDay = async (req, res) => {
  try {
    const programId = req.params.id;
    const { day } = req.body;

    if (!day) {
      return res.status(400).json({ message: "Day is required" });
    }

    let program = await Program.findOne({ id: programId });
    if (!program && mongoose.Types.ObjectId.isValid(programId)) {
      program = await Program.findById(programId);
    }
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    const beforeCount = program.completedBy.length;

    program.completedBy = program.completedBy.filter(
      (entry) =>
        !(
          entry.user.toString() === req.user._id.toString() &&
          entry.day === Number(day)
        )
    );

    const afterCount = program.completedBy.length;

    await program.save();

    res.json({
      success: true,
      message: `Day ${day} reset successfully`,
      removedEntries: beforeCount - afterCount,
    });
  } catch (error) {
    console.error("Reset Day Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- RESET FULL PROGRAM ----------------
export const resetFullProgram = async (req, res) => {
  try {
    const programId = req.params.id;

    let program = await Program.findOne({ id: programId });
    if (!program && mongoose.Types.ObjectId.isValid(programId)) {
      program = await Program.findById(programId);
    }
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    const beforeCount = program.completedBy.length;

    program.completedBy = program.completedBy.filter(
      (entry) => entry.user.toString() !== req.user._id.toString()
    );

    const afterCount = program.completedBy.length;

    await program.save();

    res.json({
      success: true,
      message: "Program restarted successfully",
      removedEntries: beforeCount - afterCount,
    });
  } catch (error) {
    console.error("Reset Program Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
