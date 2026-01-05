import express from "express";
import {
  getUserFaces,
  getUserFaceById,
  getFacesByUserId,
  createUserFace,
  updateUserFace,
  deleteUserFace
} from "../controllers/userFaceController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { uploadImage } from "../middleware/uploadImage.js";
import { multerErrorHandler } from "../middleware/multerErrorHandler.js";

const router = express.Router();

router.get("/", protect, getUserFaces);
router.get("/user/:user_id", protect, getFacesByUserId);
router.get("/:id", protect, getUserFaceById);

router.post("/", protect, uploadImage.single("photo"), multerErrorHandler, createUserFace);
router.put("/:id", protect, updateUserFace);
router.delete("/:id", protect, deleteUserFace);

export default router;
