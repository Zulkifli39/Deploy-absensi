import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { kepalaSubInstalasiOnly } from "../middleware/roleMiddleware.js";

import {
  getShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift
} from "../controllers/shiftController.js";

const router = express.Router();

// READ
router.get("/", protect, getShifts);
router.get("/:id", protect, getShiftById);

// WRITE (Admin + Kepala + Kepala Sub)
router.post("/", protect, kepalaSubInstalasiOnly, createShift);
router.put("/:id", protect, kepalaSubInstalasiOnly, updateShift);
router.delete("/:id", protect, kepalaSubInstalasiOnly, deleteShift);

export default router;
