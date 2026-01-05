import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { kepalaInstalasiOnly } from "../middleware/roleMiddleware.js"; 
import {
  createUserShiftSchedule,
  getUserShiftSchedules,
  updateUserShiftSchedule,
  bulkCreateUserShiftSchedule,
  bulkEditUserShiftSchedule,
  bulkMultiUserFullPeriod,
  uploadScheduleFromExcel,
  previewScheduleFromExcel,
  downloadScheduleTemplate
} from "../controllers/userShiftScheduleController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      return cb(new Error("File harus Excel"));
    }
    cb(null, true);
  }
});


// Route untuk menambah jadwal shift per user
router.post(
  "/:period_id",
  protect,
  kepalaInstalasiOnly,
  createUserShiftSchedule
);

// Route untuk mendapatkan semua jadwal per user dalam periode
// MODIFIED: Removed kepalaInstalasiOnly to allow users to see their own schedule
router.get(
  "/:period_id",
  protect,
  // kepalaInstalasiOnly, 
  getUserShiftSchedules
);

// Route untuk mengupdate jadwal shift per user
router.put(
  "/:period_id/:schedule_id",
  protect,
  kepalaInstalasiOnly,
  updateUserShiftSchedule
);

router.post(
  "/:period_id/bulk",
  protect,
  kepalaInstalasiOnly,
  bulkCreateUserShiftSchedule
);


router.put(
  "/:period_id/bulk",
  protect,
  kepalaInstalasiOnly,
  bulkEditUserShiftSchedule
);

router.post(
  "/:period_id/bulk-multi",
  protect,
  kepalaInstalasiOnly,
  bulkMultiUserFullPeriod
);

router.post(
  "/:period_id/preview-excel",
  protect,
  kepalaInstalasiOnly,
  upload.single("file"),
  previewScheduleFromExcel
);

router.post(
  "/:period_id/upload-excel",
  protect,
  kepalaInstalasiOnly,
  upload.single("file"),
  uploadScheduleFromExcel
);


router.get(
  "/:period_id/template-excel",
  protect,
  kepalaInstalasiOnly,
  downloadScheduleTemplate
);

export default router;