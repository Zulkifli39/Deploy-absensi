import express from "express";
import {
  getEmployeeStatus,
  getEmployeeStatusById,
  createEmployeeStatus,
  updateEmployeeStatus,
  deactivateEmployeeStatus
} from "../controllers/employeeStatusController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";


const router = express.Router();

router.get("/", protect, getEmployeeStatus);
router.get("/:id", protect, getEmployeeStatusById);

router.post("/", protect, adminOnly, createEmployeeStatus);
router.put("/:id", protect, adminOnly, updateEmployeeStatus);

// Soft deactivate, bukan delete
router.delete("/:id", protect, adminOnly, deactivateEmployeeStatus);

export default router;
