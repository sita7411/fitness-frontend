// middleware/uploadMiddleware.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/* -------- Cloudinary Storage -------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fitness/programs",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1200, height: 675, crop: "limit" },
      { quality: "auto:good" },
    ],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 50, // max 50 images (1 main + exercise thumbnails)
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const valid = allowed.test(file.originalname.toLowerCase()) && 
                  allowed.test(file.mimetype);
    if (valid) return cb(null, true);
    cb(new Error("Only JPG, PNG, WebP images allowed!"));
  },
});

/* -------- YEH HI FIX HAI: .any() use karo -------- */
export const uploadProgramFiles = upload.any();

