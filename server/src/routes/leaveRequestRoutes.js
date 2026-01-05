import express from "express";
import {
  getLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  approveLeave,
  rejectLeave
} from "../controllers/leaveRequestController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly, staffOnly } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get("/", protect, getLeaveRequests);
router.get("/:id", protect, getLeaveRequestById);

router.post("/", protect, createLeaveRequest);

router.put("/:id/approve", protect, approveLeave);
router.put("/:id/reject", protect, rejectLeave);

export default router;
