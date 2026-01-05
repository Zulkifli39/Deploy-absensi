import multer from "multer";
import path from "path";
import fs from "fs";

const baseDir = "uploads/information";

const pdfDir = `${baseDir}/pdf`;
const imageDir = `${baseDir}/image`;

[pdfDir, imageDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "pdf") {
      cb(null, pdfDir);
    } else if (file.fieldname === "image") {
      cb(null, imageDir);
    }
  },

  filename: (req, file, cb) => {
    const title = req.body.title;
    if (!title) return cb(new Error("Title wajib diisi"));

    const safeTitle = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    const ext = path.extname(file.originalname);
    cb(null, `${safeTitle}-${Date.now()}${ext}`);
  }
});

export const uploadInformation = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // default max (PDF)
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "image") {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Image tidak valid"));
      }
    }

    if (file.fieldname === "pdf") {
      if (file.mimetype !== "application/pdf") {
        return cb(new Error("PDF harus format PDF"));
      }
    }

    cb(null, true);
  }

});
