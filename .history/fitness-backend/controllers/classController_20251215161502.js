import ClassModel from "../models/Class.js";
import mongoose from "mongoose";
import User from "../models/User.js";
const transformFrontendToBackend = (
  data,
  thumbnailUrl = null,
  exerciseThumbnails = {}
) => {
  const daysWithThumbnails = (data.days || []).map((day, dayIndex) => ({
    title: day.title || "Untitled Day",
    exercises: (day.exercises || []).map((ex, exIndex) => {
      const key = `exercise_${dayIndex}_${exIndex}`;
      const newThumb = exerciseThumbnails[key];

      return {
        title: ex.title || "Exercise",
        type: ex.type || "time",
        time: ex.time != null ? ex.time : null,
        reps: ex.reps != null ? ex.reps : null,
        sets: ex.sets != null ? ex.sets : null,
        notes: ex.notes || "",
        thumbnail: newThumb || null,
        section: ex.section || "Workout",
      };
    }),
  }));

  return {
    title: data.title || "Untitled",
    description: data.description || "",
    thumbnail: thumbnailUrl || null,
    price: Number(data.price) || 0,
    level: data.level || "Beginner",
    duration: data.duration || "30 – 45 min",
    trainerName: data.trainerName || "",
    status: data.status || "Active",
    plans: data.plans || [],
    date: data.date || null,
    time: data.time || "",
    caloriesBurned: data.caloriesBurned || "0 kcal",
    days: daysWithThumbnails,
    equipment: data.equipment || [],
  };
};

// ------------------ Helper: safe JSON parse ------------------
const parseIfString = (val) => {
  if (!val) return {};
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (e) {
      console.warn("Could not parse JSON, returning empty object", e);
      return {};
    }
  }
  return val;
};

// ------------------ CREATE CLASS  ------------------
export const createClass = async (req, res) => {
  try {
    console.log("CREATE CLASS START");

    // Parse data
    let data = {};
    if (req.body?.data) {
      data = parseIfString(req.body.data);
    }

    // MAIN THUMBNAIL
   const thumbnailFile = req.files?.find(f => f.fieldname === "thumbnail");
const mainThumbnail = thumbnailFile ? thumbnailFile.path : null;  // .path = Cloudinary secure_url

console.log("Main thumbnail file:", thumbnailFile ? "Found" : "Not found");
console.log("Main thumbnail URL:", mainThumbnail);

// EXERCISE THUMBNAILS
const exerciseThumbnails = {};
req.files?.forEach((f) => {
  if (f.fieldname.startsWith("exercise_")) {
    const key = f.fieldname.replace("exercise_", "");  // e.g., "0_0"
    exerciseThumbnails[key] = f.path;  // Cloudinary secure_url
    console.log(`Exercise thumb: ${f.fieldname} → ${f.path}`);
  }
});

console.log("Total exercise thumbnails mapped:", Object.keys(exerciseThumbnails).length);

    // TRANSFORM
    const transformed = transformFrontendToBackend(
      data,
      mainThumbnail,
      exerciseThumbnails
    );
    console.log("Days count:", transformed.days.length);
    console.log(
      "Total exercises:",
      transformed.days.reduce((sum, day) => sum + day.exercises.length, 0)
    );

    //  SAVE
    const newClass = new ClassModel(transformed);
    const savedClass = await newClass.save();

    console.log("SAVED:", savedClass._id);
    res.status(201).json(savedClass);
  } catch (err) {
    console.error(" CREATE ERROR:", err);
    res.status(500).json({
      message: "Failed to create class",
      error: err.message,
      code: err.code,
    });
  }
};

// ------------------ UPDATE CLASS ------------------
export const updateClass = async (req, res) => {
  try {
    let data = parseIfString(req.body.data || req.body);

    const mainThumbnail =
      req.files?.find((f) => f.fieldname === "thumbnail")?.path || null;
    const exerciseThumbnails = {};
    req.files?.forEach((f) => {
      if (f.fieldname.startsWith("exercise_")) {
        exerciseThumbnails[f.fieldname.replace("exercise_", "")] = f.path;
      }
    });

    const transformed = transformFrontendToBackend(
      data,
      mainThumbnail,
      exerciseThumbnails
    );

    const updated = await ClassModel.findByIdAndUpdate(
      req.params.id,
      transformed,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Class not found" });
    res.json(updated);
  } catch (err) {
    console.error(" UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ------------------ GET ALL CLASSES FIXED ------------------
export const getAllClasses = async (req, res) => {
  try {
    const classes = await ClassModel.find().sort({ createdAt: -1 }).lean();
    console.log(` Total classes in DB: ${classes.length}`);
    res.json(classes);
  } catch (err) {
    console.error(" GET ALL ERROR:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch classes", error: err.message });
  }
};

// ------------------ GET CLASS BY ID ------------------
export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    const cls = await ClassModel.findById(id).lean();
    if (!cls) return res.status(404).json({ message: "Class not found" });

    res.json(cls);
  } catch (err) {
    console.error("GET BY ID ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ------------------ DELETE CLASS ------------------
export const deleteClass = async (req, res) => {
  try {
    const cls = await ClassModel.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    console.error(" DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

// ------------------ LIST ACTIVE CLASSES FIXED ------------------
export const listActiveClasses = async (req, res) => {
  try {
    //  SHOW ALL ACTIVE CLASSES (no date filter)
    const classes = await ClassModel.find({ status: "Active" })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Active classes for customers: ${classes.length}`);
    res.json(classes);
  } catch (err) {
    console.error(" ACTIVE CLASSES ERROR:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch active classes", error: err.message });
  }
};

// ------------------------ GET USER CLASSES — FINAL FIXED VERSION ------------------------
export const getUserClasses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    let finalClasses = [];

    // 1. Purchased classes — अब 101% safe
    for (const purchased of user.purchasedClasses || []) {
      if (!purchased.classId) continue;

      let classObjectId;
      try {
        // String हो या ObjectId object — दोनों handle करेगा
        classObjectId = new mongoose.Types.ObjectId(
          String(purchased.classId).trim()
        );
      } catch (err) {
        console.warn("Invalid classId in purchasedClasses:", purchased.classId);
        continue; // skip corrupted entry
      }

      const cls = await ClassModel.findById(classObjectId).lean();
      if (cls) finalClasses.push(cls);
    }

    // 2. Assigned classes — भी safe
    for (const assignedId of user.assignedClasses || []) {
      if (!assignedId) continue;

      let classObjectId;
      try {
        classObjectId = new mongoose.Types.ObjectId(String(assignedId).trim());
      } catch (err) {
        console.warn("Invalid assignedClass ID:", assignedId);
        continue;
      }

      const cls = await ClassModel.findById(classObjectId).lean();
      if (cls) finalClasses.push(cls);
    }

    // 3. Membership classes
    if (user.membership?.isActive) {
      const allowedPlans = ["Basic"];
      if (user.membership.plan === "Premium") allowedPlans.push("Premium");
      if (user.membership.plan === "Pro") allowedPlans.push("Pro");

      const membershipClasses = await ClassModel.find({
        status: "Active",
        plans: { $in: allowedPlans },
      }).lean();

      finalClasses.push(...membershipClasses);
    }

    // Remove duplicates
    const uniqueClasses = Object.values(
      finalClasses.reduce((acc, cls) => {
        const key = cls._id.toString();
        if (!acc[key]) acc[key] = cls;
        return acc;
      }, {})
    );

    // Clean response
    const clean = uniqueClasses.map((c) => ({
      _id: c._id,
      id: c._id.toString(),
      title: c.title,
      description: c.description || "",
      thumbnail: c.thumbnail || "/default-class.jpg",
      duration: c.duration || "30-45 min",
      level: c.level || "Beginner",
      trainerName: c.trainerName || "Trainer",
      caloriesBurned: c.caloriesBurned || "0 kcal",
      status: c.status || "Active",
      plans: c.plans || [],
      days: c.days || [],
      equipment: c.equipment || [],
      section: c.section || "",
    }));

    res.json({ classes: clean, total: clean.length });
  } catch (err) {
    console.error("getUserClasses Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ TOGGLE CLASS STATUS ------------------
export const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const cls = await ClassModel.findById(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    cls.status = cls.status === "Active" ? "Inactive" : "Active";
    await cls.save();

    res.json({ message: `Class status updated to ${cls.status}`, class: cls });
  } catch (err) {
    console.error("TOGGLE STATUS ERROR:", err);
    res
      .status(500)
      .json({ message: "Failed to toggle status", error: err.message });
  }
};
