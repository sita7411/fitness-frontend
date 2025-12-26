import NutritionPlan from "../models/NutritionPlan.js";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// ------------------------ CREATE PLAN ------------------------
export const createPlan = async (req, res) => {
  try {
    let data = {};

    // Parse JSON (from formData.append("plan", JSON.stringify(...)))
    try {
      const jsonData = req.body.data || req.body.plan || "{}";
      data = JSON.parse(jsonData);
      console.log("✅ Using JSON data for create");
    } catch (jsonErr) {
      console.log("⚠️ JSON parsing failed, falling back to req.body");
      data = { ...req.body };
    }

    // Find cover image file
    const coverFile = req.files?.find((f) => f.fieldname === "coverImage");

    // Handle meal thumbnails
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.fieldname.startsWith("meal-")) {
          const [, dayIndexStr, mealIndexStr] = file.fieldname.split("-");
          const dayIndex = parseInt(dayIndexStr);
          const mealIndex = parseInt(mealIndexStr);

          if (!isNaN(dayIndex) && !isNaN(mealIndex)) {
            // Ensure nested structure exists
            if (!data.days) data.days = [];
            if (!data.days[dayIndex]) data.days[dayIndex] = { meals: [] };
            if (!data.days[dayIndex].meals[mealIndex]) data.days[dayIndex].meals[mealIndex] = {};

            data.days[dayIndex].meals[mealIndex].thumbnail = {
              url: file.path,
              fileName: file.filename, // Cloudinary public_id (important for deletion)
            };
          }
        }
      });
    }

    // Set cover image (required for create)
    if (!coverFile) {
      return res.status(400).json({ message: "Cover image is required" });
    }
    data.coverImage = {
      url: coverFile.path,
      fileName: coverFile.filename,
    };

    // Defaults
    data.title = data.title?.trim() || "Untitled Plan";
    data.level = data.level || "Beginner";
    data.plans = Array.isArray(data.plans) && data.plans.length > 0 ? data.plans : ["Basic"];
    data.status = data.status || "Active";

    const plan = await NutritionPlan.create(data);
    res.status(201).json(plan);
  } catch (err) {
    console.error("❌ Create plan error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------------ GET ALL ------------------------
export const getPlans = async (req, res) => {
  try {
    const plans = await NutritionPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------ GET ONE ------------------------
export const getPlanById = async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------ UPDATE PLAN (FULLY FIXED) ------------------------
export const updatePlan = async (req, res) => {
  try {
    const planId = req.params.id;

    // 1. Load existing plan first (critical for preserving images)
    const oldPlan = await NutritionPlan.findById(planId);
    if (!oldPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // 2. Parse incoming JSON data (text fields only)
    let updatedData = {};
    try {
      const jsonData = req.body.data || req.body.plan || "{}";
      updatedData = JSON.parse(jsonData);
    } catch (err) {
      updatedData = { ...req.body };
    }

    // 3. Build the final update object — start with old data
    const finalData = {
      title: updatedData.title ?? oldPlan.title,
      subtitle: updatedData.subtitle ?? oldPlan.subtitle,
      description: updatedData.description ?? oldPlan.description,
      level: updatedData.level ?? oldPlan.level,
      price: updatedData.price ?? oldPlan.price,
      plans: Array.isArray(updatedData.plans) && updatedData.plans.length > 0
        ? updatedData.plans
        : oldPlan.plans,
      status: updatedData.status ?? oldPlan.status,

      // Preserve old images by default
      coverImage: oldPlan.coverImage,

      // Preserve full days/meals structure with old thumbnails
      days: oldPlan.days.map((day) => ({
        title: updatedData.days?.find((d, i) => i === oldPlan.days.indexOf(day))?.title || day.title,
        meals: day.meals.map((meal) => {
          const updatedMeal = updatedData.days
            ?.find((d, i) => i === oldPlan.days.indexOf(day))
            ?.meals?.find((m, j) => j === day.meals.indexOf(meal));

          return {
            type: updatedMeal?.type || meal.type,
            title: updatedMeal?.title || meal.title,
            description: updatedMeal?.description || meal.description,
            ingredients: updatedMeal?.ingredients || meal.ingredients,
            instructions: updatedMeal?.instructions || meal.instructions,
            tools: updatedMeal?.tools || meal.tools,
            notes: updatedMeal?.notes || meal.notes,
            nutrition: updatedMeal?.nutrition || meal.nutrition,
            thumbnail: meal.thumbnail, // preserve old thumbnail
          };
        }),
      })),
    };

    // 4. Override only with NEW uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (file.fieldname === "coverImage") {
          // Optional: delete old cover from Cloudinary
          if (oldPlan.coverImage?.fileName) {
            await cloudinary.uploader.destroy(oldPlan.coverImage.fileName).catch(console.warn);
          }

          finalData.coverImage = {
            url: file.path,
            fileName: file.filename,
          };
        } else if (file.fieldname.startsWith("meal-")) {
          const parts = file.fieldname.split("-");
          if (parts.length === 3) {
            const dayIndex = parseInt(parts[1]);
            const mealIndex = parseInt(parts[2]);

            if (
              !isNaN(dayIndex) &&
              !isNaN(mealIndex) &&
              finalData.days[dayIndex]?.meals[mealIndex]
            ) {
              // Optional: delete old meal thumbnail
              const oldThumbnail = oldPlan.days[dayIndex]?.meals[mealIndex]?.thumbnail;
              if (oldThumbnail?.fileName) {
                await cloudinary.uploader.destroy(oldThumbnail.fileName).catch(console.warn);
              }

              finalData.days[dayIndex].meals[mealIndex].thumbnail = {
                url: file.path,
                fileName: file.filename,
              };
            }
          }
        }
      });
    }

    // 5. Save updated plan
    const updatedPlan = await NutritionPlan.findByIdAndUpdate(
      planId,
      finalData,
      { new: true, runValidators: true }
    );

    res.json(updatedPlan);
  } catch (err) {
    console.error("❌ Update plan error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------------ DELETE PLAN (with thumbnail cleanup) ------------------------
export const deletePlan = async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Delete cover
    if (plan.coverImage?.fileName) {
      await cloudinary.uploader.destroy(plan.coverImage.fileName).catch(console.warn);
    }

    // Delete all meal thumbnails
    if (plan.days && plan.days.length > 0) {
      for (const day of plan.days) {
        for (const meal of day.meals) {
          if (meal.thumbnail?.fileName) {
            await cloudinary.uploader.destroy(meal.thumbnail.fileName).catch(console.warn);
          }
        }
      }
    }

    await NutritionPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan and all images deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------------ UPDATE STATUS ONLY ------------------------
export const updatePlanStatus = async (req, res) => {
  try {
    const plan = await NutritionPlan.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------ GET USER NUTRITION PLANS ------------------------
export const getUserNutritionPlans = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    let finalPlans = [];

    // Purchased plans
    if (user.purchasedNutritionPlans?.length > 0) {
      for (const purchased of user.purchasedNutritionPlans) {
        if (!purchased.planId) continue;
        try {
          const plan = await NutritionPlan.findById(purchased.planId).lean();
          if (plan) finalPlans.push(plan);
        } catch (err) {
          console.warn("Invalid purchased planId:", purchased.planId);
        }
      }
    }

    // Assigned plans
    if (user.assignedNutritionPlans?.length > 0) {
      for (const assignedId of user.assignedNutritionPlans) {
        try {
          const plan = await NutritionPlan.findById(assignedId).lean();
          if (plan) finalPlans.push(plan);
        } catch (err) {
          console.warn("Invalid assigned planId:", assignedId);
        }
      }
    }

    // Membership plans
    if (user.membership?.isActive) {
      const allowedPlans = ["Basic"];
      if (user.membership.plan === "Premium") allowedPlans.push("Premium");
      if (user.membership.plan === "Pro") allowedPlans.push("Pro", "Premium");

      const membershipPlans = await NutritionPlan.find({
        status: "Active",
        plans: { $in: allowedPlans },
      }).lean();

      finalPlans.push(...membershipPlans);
    }

    // Remove duplicates
    const uniquePlans = Array.from(
      new Map(finalPlans.map((p) => [p._id.toString(), p])).values()
    );

    res.json({ plans: uniquePlans, total: uniquePlans.length });
  } catch (err) {
    console.error("getUserNutritionPlans Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};