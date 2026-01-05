import express from "express";
import { registerUser, getUsers, getUserById, updateUser, softDeleteUser } from "../controllers/userControllerNew.js";
import { uploadImage } from "../middleware/uploadImage.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), registerUser);
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, adminOnly, upload.single("avatar"), updateUser);

router.delete("/:id", protect, adminOnly, softDeleteUser);

export default router;



