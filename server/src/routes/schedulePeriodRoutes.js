import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  adminOnly,
  kepalaInstalasiOnly,
  kepalaSubInstalasiOnly
} from "../middleware/roleMiddleware.js";

import {
  getSchedulePeriods,
  getSchedulePeriodById,
  createSchedulePeriod,
  lockSchedulePeriod,
  updateSchedulePeriod,
  deleteSchedulePeriod
} from "../controllers/schedulePeriodController.js";

const router = express.Router();

// GET Semua Schedule Period (belum dikunci)
router.get(
  "/",
  protect,
  // kepalaSubInstalasiOnly,  <-- kuhapus agar role user bisa mengakses
  getSchedulePeriods
);

// GET Schedule Period berdasarkan ID
router.get(
  "/:id",
  protect,
  kepalaSubInstalasiOnly,  // Mengizinkan akses untuk Kepala Sub Instalasi
  getSchedulePeriodById
);

// POST untuk membuat Schedule Period baru
router.post(
  "/",
  protect,
  kepalaInstalasiOnly,  // Mengizinkan akses untuk Kepala Instalasi
  createSchedulePeriod
);

// PUT untuk mengunci Schedule Period
router.put(
  "/:id/lock",
  protect,
  kepalaInstalasiOnly,  // Mengizinkan akses untuk Kepala Instalasi
  lockSchedulePeriod
);

// Optional: UPDATE untuk mengubah informasi periode (Jika diperlukan)
router.put(
  "/:id",
  protect,
  kepalaInstalasiOnly,  // Hanya Kepala Instalasi yang bisa update
  updateSchedulePeriod
);

// DELETE untuk menghapus Schedule Period
router.delete(
  "/:id",
  protect,
  kepalaInstalasiOnly,  // Hanya Kepala Instalasi yang bisa hapus
  deleteSchedulePeriod
);

export default router;