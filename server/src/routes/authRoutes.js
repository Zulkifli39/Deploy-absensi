import express from "express";
import { register, login, getUserProfile, updateProfile, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
// import {upload} from "../middleware/uploadMiddleware.js"
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.delete("/profile", protect, getUserProfile);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword)

export default router;

