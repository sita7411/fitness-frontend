// middleware/uploadMiddleware.js

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const classStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: (req, file) => {

      if (file.fieldname.startsWith("exercise_")) {
        return "fitness/classes/exercises";
      }
      return "fitness/classes";
    },
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1200, height: 675, crop: "limit" },
      { quality: "auto:good" },
    ],
    public_id: (req, file) => {
      return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    },
  },
});

const programStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fitness/programs",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1200, height: 675, crop: "limit" },
      { quality: "auto:good" },
    ],
    public_id: (req, file) => `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  },
});

// ============ EXPORTED MIDDLEWARES ============

export const uploadProgramThumbnail = multer({
  storage: programStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "thumbnail" || file.fieldname.startsWith("exercise-")) {
      cb(null, true);
    } else {
      cb(new Error(`Unexpected field: ${file.fieldname}`), false);
    }
  },
}).any(); // Dynamic fields ke liye .any() zaroori hai

export const uploadClassFiles = multer({
  storage: classStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024,  
    files: 51                   
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "thumbnail" || file.fieldname.startsWith("exercise_")) {
      cb(null, true);
    } else {
      cb(new Error(`Unexpected field: ${file.fieldname}`), false);
    }
  },
}).any();   

// ======================= NUTRITION STORAGE =======================

const nutritionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: (req, file) => {
      // You can separate cover images vs meals if you want
      if (file.fieldname === "coverImage") return "fitness/nutrition/covers";
      if (file.fieldname.startsWith("meal-")) return "fitness/nutrition/meals";
      return "fitness/nutrition/others";
    },
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1200, height: 675, crop: "limit" },
      { quality: "auto:good" },
    ],
    public_id: (req, file) => `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  },
});

// Middleware for Nutrition Plan uploads
export const uploadNutritionFiles = multer({
  storage: nutritionStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "coverImage" || file.fieldname.startsWith("meal-")) {
      cb(null, true);
    } else {
      cb(new Error(`Unexpected field: ${file.fieldname}`), false);
    }
  },
}).any(); 


export const uploadClassThumbnail = multer({
  storage: classStorage,
}).single("thumbnail");

export const uploadExerciseThumbnails = multer({
  storage: classStorage,
}).array("exerciseThumbnails", 50);