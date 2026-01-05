import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {kepalaSubInstalasiOnly} from "../middleware/roleMiddleware.js";

import { downloadAttendanceReport } from "../controllers/attendanceReportController.js";
import { downloadAttendanceReportById } from "../controllers/attendanceReportController.js";
import { downloadAttendanceReportByDateRange } from "../controllers/attendanceReportController.js";
import { downloadAttendanceReportByIdAndDateRange } from "../controllers/attendanceReportController.js";

const router = express.Router();

router.get("/attendance", protect, kepalaSubInstalasiOnly, downloadAttendanceReport);
router.get("/attendance/by-id", protect, kepalaSubInstalasiOnly, downloadAttendanceReportById);
router.get("/attendance/range", protect, kepalaSubInstalasiOnly, downloadAttendanceReportByDateRange);
router.get("/attendance/by-id/range", protect, kepalaSubInstalasiOnly, downloadAttendanceReportByIdAndDateRange);

export default router;
