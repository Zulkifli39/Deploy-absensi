import express from "express";
import {
  getAllInformation,
  getInformationById,
  createInformation,
  updateInformation,
  deleteInformation
} from "../controllers/informationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { uploadInformation } from "../middleware/uploadInformationPdf.js";

import { multerErrorHandler } from "../middleware/multerErrorHandler.js";



const router = express.Router();

router.get("/", protect, getAllInformation);
router.get("/:id", protect, getInformationById);

router.post(
  "/",
  protect,
  adminOnly,
  uploadInformation.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 1 }
  ]),
  multerErrorHandler,
  createInformation
);

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadInformation.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 }
  ]),
  multerErrorHandler,
  updateInformation
);


router.delete("/:id", protect, adminOnly, deleteInformation);

export default router;



