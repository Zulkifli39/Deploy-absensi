import express from "express";
import {
  getLeaveTypes,
  getLeaveTypeById,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType
} from "../controllers/leaveTypeController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getLeaveTypes);
router.get("/:id", protect, getLeaveTypeById);

router.post("/", protect, createLeaveType);
router.put("/:id", protect, updateLeaveType);
router.delete("/:id", protect, deleteLeaveType);

export default router;
