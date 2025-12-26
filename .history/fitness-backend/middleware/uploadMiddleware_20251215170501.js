// middleware/uploadMiddleware.js

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Cloudinary storage for classes (main + exercises)
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
}).single("thumbnail");

export const uploadClassFiles = multer({
  storage: classStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024,  
    files: 51                   
  },
  fileFilter: (req, file, cb) => {
    // Allow only these fields
    if (file.fieldname === "thumbnail" || file.fieldname.startsWith("exercise_")) {
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