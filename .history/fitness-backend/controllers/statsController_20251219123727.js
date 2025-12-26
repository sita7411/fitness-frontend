import DailyStats from "../models/DailyStats.js";
import "../models/ScheduleEvent.js";
import mongoose from "mongoose";
export const getTodayStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA"); // "2025-12-09"

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-CA");

    let stats = await DailyStats.findOne({
      userId: req.user._id,
      date: todayStr,
    });

    if (!stats) {
      stats = await DailyStats.create({
        userId: req.user._id,
        date: todayStr,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        water: 0,
        steps: 0,
        workoutMinutes: 0,
        heartRate: [],
        averageHeartRate: 78,
        peakHeartRate: null,
        weight: req.user.weight || 0,
        dailyGoals: [],
      });
      console.log("Created new DailyStats for today:", todayStr);
    }

    // calerioes 
    const yesterdayStats = await DailyStats.findOne({
      userId: req.user._id,
      date: yesterdayStr,
    });

    res.json({
      water: Number(((stats.water || 0) * 0.25).toFixed(1)),
      calories: stats.calories || 0,
      steps: stats.steps || 0,
      workoutMinutes: stats.workoutMinutes || 0,
      weight: stats.weight || req.user.weight || 0,
      averageHeartRate:
        stats.averageHeartRate ||
        (stats.heartRate?.length > 0
          ? Math.round(
              stats.heartRate.reduce((sum, hr) => sum + hr.value, 0) /
                stats.heartRate.length
            )
          : 78),

      peakHeartRate: stats.peakHeartRate || null,
      todayHeartRateEntries: stats.heartRate?.length || 0,
      heartRateList: stats.heartRate || [],
      yesterdayCalories: yesterdayStats?.calories || null,
      dailyGoals: stats.dailyGoals || [],
      completedMeals: stats.completedMeals || [],
    });
  } catch (e) {
    console.error("getTodayStats error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateStatsFromMeal = async (req, res) => {
  try {
    const { mealId, calories, protein, carbs, fats } = req.body; // ← mealId add kiya

    // Validation
    if (!mealId) {
      return res.status(400).json({ message: "mealId is required" });
    }

    const today = new Date().toLocaleDateString("en-CA");

    let stats = await DailyStats.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!stats) {
      stats = await DailyStats.create({
        userId: req.user._id,
        date: today,
        completedMeals: [],
      });
    }

    // Add macros
    stats.calories += Number(calories || 0);
    stats.protein += Number(protein || 0);
    stats.carbs += Number(carbs || 0);
    stats.fats += Number(fats || 0);

    // Prevent duplicates & add mealId
    if (!stats.completedMeals.includes(mealId)) {
      stats.completedMeals.push(mealId);
    }

    await stats.save();

    res.json({
      success: true,
      calories: stats.calories,
      protein: stats.protein,
      carbs: stats.carbs,
      fats: stats.fats,
      completedMeals: stats.completedMeals, 
    });
  } catch (e) {
    console.error("updateStatsFromMeal error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateWater = async (req, res) => {
  try {
    const { increment } = req.body;

    const today = new Date().toISOString().split("T")[0];

    let stats = await DailyStats.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!stats) {
      stats = await DailyStats.create({
        userId: req.user._id,
        date: today,
      });
    }

    stats.water += increment || 1;
    await stats.save();

    res.json(stats);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 1. Weekly Stats

export const getWeeklyStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const stats = await DailyStats.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo.toISOString().split("T")[0] },
    }).sort({ date: 1 });

    const daysMap = {};
    stats.forEach((s) => {
      daysMap[s.date] = s;
    });

    const result = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = dayNames[date.getDay()];

      const stat = daysMap[dateStr] || {};

      result.push({
        day: dayName,
        date: dateStr,

        workoutMinutes: stat.workoutMinutes || 0,
        weight: stat.weight
          ? Number(stat.weight.toFixed(1))
          : req.user.weight || 0,

        calories: stat.calories || 0,
        protein: stat.protein || 0,
        carbs: stat.carbs || 0,
        fats: stat.fats || 0,
        water: stat.water || 0,
        steps: stat.steps || 0,
      });
    }

    res.json(result);
  } catch (e) {
    console.error("getWeeklyStats error:", e);
    res.status(500).json({ message: e.message });
  }
};

// 2. All Time Summary 
export const getSummary = async (req, res) => {
  try {
    const stats = await DailyStats.find({ userId: req.user._id });

    const total = stats.reduce(
      (acc, s) => ({
        calories: acc.calories + (s.calories || 0),
        protein: acc.protein + (s.protein || 0),
        water: acc.water + (s.water || 0),
      }),
      { calories: 0, protein: 0, water: 0 }
    );

    const daysTracked = stats.length;

    res.json({
      totalCaloriesBurned: total.calories,
      totalProtein: total.protein,
      totalWaterLiters: (total.water * 0.25).toFixed(1), // assuming 250ml per glass
      daysTracked,
      avgDailyCalories:
        daysTracked > 0 ? Math.round(total.calories / daysTracked) : 0,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateHeartRate = async (req, res) => {
  try {
    const { heartRate, programTitle, dayTitle } = req.body;

    if (!heartRate || heartRate < 30 || heartRate > 250) {
      return res.status(400).json({ message: "Invalid Heart Rate" });
    }

    const today = new Date().toISOString().split("T")[0];

    let stats = await DailyStats.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!stats) {
      stats = await DailyStats.create({
        userId: req.user._id,
        date: today,
        heartRate: [],
      });
    }

    // Add new entry
    stats.heartRate.push({
      value: Number(heartRate),
      programTitle: programTitle || "Workout",
      dayTitle: dayTitle || "",
    });

    // Auto-calculate average & peak
    const values = stats.heartRate.map((hr) => hr.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    stats.averageHeartRate = Math.round(avg);
    stats.peakHeartRate = Math.max(...values);

    await stats.save();

    res.json({
      success: true,
      message: "Heart rate recorded!",
      todayHeartRates: stats.heartRate,
      averageHeartRate: stats.averageHeartRate,
      peakHeartRate: stats.peakHeartRate,
    });
  } catch (e) {
    console.error("updateHeartRate error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// Workout minutes update karne ke liye
export const updateWorkoutMinutes = async (req, res) => {
  try {
    const { minutes } = req.body;

    if (!minutes || minutes < 0) {
      return res.status(400).json({ message: "Invalid minutes" });
    }

    const today = new Date().toLocaleDateString("en-CA");

    let stats = await DailyStats.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!stats) {
      stats = await DailyStats.create({
        userId: req.user._id,
        date: today,
        workoutMinutes: 0, // default set
      });
    }

    stats.workoutMinutes = (stats.workoutMinutes || 0) + minutes;
    await stats.save();

    res.json({
      success: true,
      workoutMinutes: stats.workoutMinutes,
    });
  } catch (e) {
    console.error("updateWorkoutMinutes error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// updateWeight — Day/Session complete pe weight save karne ke liye
export const updateWeight = async (req, res) => {
  try {
    const { weight } = req.body; // e.g. 69.5 (number ya string)

    if (!weight || isNaN(weight) || weight < 30 || weight > 200) {
      return res.status(400).json({ message: "Invalid weight" });
    }

    const today = new Date().toLocaleDateString("en-CA");

    let stats = await DailyStats.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!stats) {
      stats = await DailyStats.create({
        userId: req.user._id,
        date: today,
        weight: Number(weight),
      });
    } else {
      stats.weight = Number(weight);
      await stats.save();
    }

    // Optional: User profile mein bhi latest weight update kar do
    req.user.weight = Number(weight);
    await req.user.save();

    res.json({ success: true, weight: Number(weight) });
  } catch (e) {
    console.error("updateWeight error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/statsController.js (or jahan bhi hai)

// GET Today's Goals
export const getTodayGoals = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA");

    const stats = await DailyStats.findOne({
      userId: req.user._id,
      date: today,
    });

    const goals = stats?.dailyGoals || [];

    res.json({ goals });
  } catch (e) {
    console.error("getTodayGoals error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD New Goal
export const addTodayGoal = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ message: "Goal text required" });

    const today = new Date().toLocaleDateString("en-CA");

    let stats = await DailyStats.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!stats) {
      stats = await DailyStats.create({
        userId: req.user._id,
        date: today,
        dailyGoals: [],
      });
    }

    const newGoal = {
      id: Date.now().toString(), // simple unique string
      text: text.trim(),
      completed: false,
    };

    stats.dailyGoals.push(newGoal);
    await stats.save();

    res.json({ success: true, goal: newGoal, allGoals: stats.dailyGoals });
  } catch (e) {
    console.error("addTodayGoal error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// TOGGLE Goal Complete
// TOGGLE Goal Complete — 100% WORKING VERSION
export const toggleGoalComplete = async (req, res) => {
  console.log("TOGGLE HIT! goalId:", req.body.goalId); // ← YE DIKHEGA TERMINAL MEIN

  try {
    const { goalId } = req.body;
    if (!goalId) return res.status(400).json({ message: "goalId missing" });

    const today = new Date().toLocaleDateString("en-CA");

    const stats = await DailyStats.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!stats) {
      return res.status(404).json({ message: "No stats found for today" });
    }

    // YE LINE BADAL DO — YEH THI ASLI GALTI
    const goalIndex = stats.dailyGoals.findIndex(
      (g) => g.id === goalId || g._id?.toString() === goalId
    );

    if (goalIndex === -1) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Toggle complete
    stats.dailyGoals[goalIndex].completed =
      !stats.dailyGoals[goalIndex].completed;
    await stats.save();

    console.log("Goal toggled successfully!");

    res.json({ success: true, allGoals: stats.dailyGoals });
  } catch (e) {
    console.error("toggleGoalComplete error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE Goal
export const deleteTodayGoal = async (req, res) => {
  try {
    const { goalId } = req.body;

    const today = new Date().toLocaleDateString("en-CA");

    const stats = await DailyStats.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!stats) return res.status(404).json({ message: "No goals today" });

    stats.dailyGoals = stats.dailyGoals.filter((g) => g.id !== goalId);
    await stats.save();

    res.json({ success: true, allGoals: stats.dailyGoals });
  } catch (e) {
    console.error("deleteTodayGoal error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLatestWorkoutSession = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentStats = await DailyStats.find({
      userId: req.user._id,
      workoutMinutes: { $gt: 0 },
    })
      .sort({ date: -1, updatedAt: -1 })
      .limit(1);

    if (recentStats.length === 0) {
      return res.json({ found: false });
    }

    const latest = recentStats[0];

    // ===== IMPROVED FALLBACKS =====
    let workoutTitle = "Workout Session";
    let thumbnail = "https://res.cloudinary.com/dnmkwvo8m/image/upload/v1764665655/fittrack/programs/d5kngehygkrjzcrh5fhi.jpg";
    let recordedWeight = null;

    // Priority 1: Real program data agar heartRate entry hai (full day complete kiya)
    if (latest.heartRate && latest.heartRate.length > 0) {
      const lastHR = latest.heartRate[latest.heartRate.length - 1];
      
      if (lastHR.programTitle) {
        workoutTitle = lastHR.programTitle;
        if (lastHR.dayTitle) {
          workoutTitle += ` – ${lastHR.dayTitle}`;
        }
      }
      if (lastHR.thumbnail) {
        thumbnail = lastHR.thumbnail;
      }
      if (lastHR.weight && lastHR.weight > 0) {
        recordedWeight = Number(lastHR.weight.toFixed(1));
      }
    } 
    // Priority 2: Agar sirf minutes hain (individual exercises ya manual), better title dikhao
    else if (latest.workoutMinutes > 0) {
      workoutTitle = `Workout • ${latest.workoutMinutes} min`;
    }

    // Weight fallback order
    if (!recordedWeight && latest.weight && latest.weight > 0) {
      recordedWeight = Number(latest.weight.toFixed(1));
    }
    if (!recordedWeight && req.user.weight && req.user.weight > 0) {
      recordedWeight = Number(req.user.weight.toFixed(1));
    }

    // Proper date format (e.g., "Friday, Dec 19")
    const formattedDate = new Date(latest.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    const avgHR = latest.heartRate?.length > 0
      ? Math.round(
          latest.heartRate.reduce((sum, hr) => sum + hr.value, 0) /
            latest.heartRate.length
        )
      : null;

    res.json({
      found: true,
      workout: workoutTitle,        
      calories: Math.round(latest.workoutMinutes * 9),
      duration: latest.workoutMinutes,
      avgHR,                           
      date: formattedDate,             
      thumbnail,                       
      weight: recordedWeight,         
    });
  } catch (e) {
    console.error("getLatestWorkoutSession error:", e);
    res.status(500).json({ message: "Server error" });
  }
};


export const getTodaySchedule = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA"); 

    const Event = mongoose.model("ScheduleEvent"); 

    const todayEvents = await Event.find({
      userId: req.user._id,
      date: today,
    }).sort({ startTime: 1 });

    const formatted = todayEvents.map(event => ({
      id: event._id,
      title: event.title,
      time: event.startTime 
        ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}` 
        : "All Day",
      completed: event.completed || false,
      source: event.source || "manual",
      thumbnail: event.sourceThumbnail || null,
    }));

    res.json({
      success: true,
      schedule: formatted
    });

  } catch (err) {
    console.error("getTodaySchedule error:", err);
    res.json({ success: true, schedule: [] }); // fail silently
  }
};