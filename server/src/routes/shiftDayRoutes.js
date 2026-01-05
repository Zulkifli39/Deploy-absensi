import express from "express";
import { createShiftDay } from "../controllers/shiftDayController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createShiftDay);

export default router;
