import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { kepalaInstalasiOnly } from "../middleware/roleMiddleware.js";
import {
  startOvertime,
  endOvertime,
  approveOvertime
} from "../controllers/overtimeController.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024
  }
});


router.post(
  "/start",
  protect,
  upload.single("photo"),
  startOvertime
);

router.post(
  "/end/:id",
  protect,
  upload.single("photo"),
  endOvertime
);


router.put(
  "/:id/approve",
  protect,
  kepalaInstalasiOnly,
  approveOvertime
);

export default router;
