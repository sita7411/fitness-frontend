// middleware/uploadMiddleware.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Common storage factory (async params avoid kar rahe hain)
const createStorage = (baseFolder) => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: (req, file) => {
        // Sync function only
        let folder = baseFolder;

        if (file.fieldname.startsWith("exercise_") || file.fieldname === "exerciseThumbnails") {
          folder = `${baseFolder}/exercises`;
        }

        return folder;
      },
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 1200, height: 675, crop: "limit" },
        { quality: "auto:good" },
      ],
      public_id: (req, file) => {
        // Unique name to avoid conflicts
        return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      },
    },
  });
};

// Multer instances with specific fields
const programStorage = createStorage("fitness/programs");
const classStorage = createStorage("fitness/classes");

export const uploadProgramThumbnail = multer({
  storage: programStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("thumbnail");

export const uploadClassThumbnail = multer({
  storage: classStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("thumbnail");

// For multiple exercise thumbnails
export const uploadExerciseThumbnails = multer({
  storage: classStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 50 },
}).array("exerciseThumbnails", 50);

// Mixed: main thumbnail + exercises
export const uploadClassFiles = multer({
  storage: classStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 51 },
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "exerciseThumbnails", maxCount: 50 },
]);