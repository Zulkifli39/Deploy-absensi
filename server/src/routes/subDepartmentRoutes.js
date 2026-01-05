import express from "express";
import {
  getSubDepartments,
  getSubDepartmentById,
  getSubDepartmentsByDepartment,
  createSubDepartment,
  updateSubDepartment,
  deleteSubDepartment
} from "../controllers/subDepartmentController.js";

import { protect} from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, getSubDepartments);
router.get("/:id", protect, getSubDepartmentById);
router.get("/department/:department_id", protect, getSubDepartmentsByDepartment);

router.post("/", protect, adminOnly, createSubDepartment);
router.put("/:id", protect, adminOnly, updateSubDepartment);
router.delete("/:id", protect, adminOnly, deleteSubDepartment);

export default router;
