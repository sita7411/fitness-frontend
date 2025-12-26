// middleware/uploadMiddleware.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/* -------- Cloudinary Storage Factory -------- */
const createStorage = (baseFolder) =>
  new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      let folder = baseFolder;

      // Exercise thumbnails ko exercises subfolder mein
      if (file.fieldname.startsWith("exercise_")) {
        folder = `${baseFolder}/exercises`;
      }

      return {
        folder,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
          { width: 1200, height: 675, crop: "limit" },
          { quality: "auto:good" },
        ],
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`, // unique name
      };
    },
  });

const storage = createStorage("fitness"); // common base

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const valid = allowed.test(file.mimetype);
    if (valid) return cb(null, true);
    cb(new Error("Only JPG, JPEG, PNG, WebP images allowed!"));
  },
});

/* -------- EXPORTS - Specific Field Uploaders -------- */

// 1. Sirf main thumbnail (class/program level)
export const uploadClassThumbnail = upload.single("thumbnail");

// 2. Multiple exercise thumbnails (field names: exercise_0_thumbnail, exercise_1_thumbnail, etc.)
export const uploadExerciseThumbnails = upload.array("exerciseThumbnails", 50);

// 3. Mixed: thumbnail + multiple exercise thumbnails
export const uploadClassFiles = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "exerciseThumbnails", maxCount: 50 },
]);