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

      // Exercise thumbnails ko subfolder me daalo
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
      };
    },
  });

/* -------- Multer Factory -------- */
const createUploader = (baseFolder) =>
  multer({
    storage: createStorage(baseFolder),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 50,
    },
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|webp/;
      const valid =
        allowed.test(file.mimetype) &&
        allowed.test(file.originalname.toLowerCase());

      if (valid) return cb(null, true);
      cb(new Error("Only JPG, PNG, WebP images allowed!"));
    },
  });

/* -------- EXPORTS -------- */
export const uploadProgramFiles = createUploader("fitness/programs").any();
export const uploadClassFiles = createUploader("fitness/classes").any();
