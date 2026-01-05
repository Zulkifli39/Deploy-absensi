import express from "express";

import {
  getUserRoles,
  getUserRoleById,
  createUserRole,
  updateUserRole,
  deactivateUserRole
} from "../controllers/userRoleController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get("/", protect, getUserRoles);
router.get("/:id", protect, getUserRoleById);

router.post("/", protect, adminOnly, createUserRole);
router.put("/:id", protect, adminOnly, updateUserRole);
router.delete("/:id", protect, adminOnly, deactivateUserRole);

export default router;
