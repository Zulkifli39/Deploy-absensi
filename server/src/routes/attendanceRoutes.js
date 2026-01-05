import express from "express";
import { checkIn, checkOut,checkAttendanceLocation, getAttendanceHistory,getAllAttendanceHistory } from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

import { uploadImage } from "../middleware/uploadImage.js";
import { multerErrorHandler } from "../middleware/multerErrorHandler.js";

const router = express.Router();

// router.get("/", protect, getAttendances);
router.get("/history", protect, getAttendanceHistory);
router.get("/all-history", protect, getAllAttendanceHistory); 
router.post("/check-location", protect, checkAttendanceLocation);
router.post("/checkin", protect, uploadImage.single("photo"), multerErrorHandler,checkIn);
router.post(
  "/checkout",
  protect,
  uploadImage.single("photo"),
  multerErrorHandler,
  checkOut
);


export default router;