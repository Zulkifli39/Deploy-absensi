import express from "express";

import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation
} from "../controllers/locationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get("/", protect, getLocations);
router.get("/:id", protect, getLocationById);

router.post("/", protect, adminOnly, createLocation);
router.put("/:id", protect, adminOnly, updateLocation);
router.delete("/:id", protect, adminOnly, deleteLocation);

export default router;
