import multer from "multer";
import fs from "fs";

const avatarDir = "uploads/avatars/";
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.mimetype)) return cb(new Error("Format gambar harus JPG/PNG"));
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 }, // 200 KB
  fileFilter
});

// Untuk Foto Absen
export const uploadAttendancePhoto = multer({
  storage,
  limits: { fileSize: 200 * 1024 }, // 200 KB
  fileFilter
});

export const uploadFile  = multer({
  storage,
  limits: { fileSize: 200 * 1024 }, // 1 MB
})