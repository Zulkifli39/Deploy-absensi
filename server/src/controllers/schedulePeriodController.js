import { prisma } from "../../config/prisma.js";
import { getDatesBetween } from "../utils/date.js";


/* =========================
   GET ALL PERIODS
========================= */
export const getSchedulePeriods = async (req, res) => {
  try {
    const data = await prisma.schedule_periods.findMany({
      select: {
        period_id: true,
        period_name: true,
        start_date: true,
        end_date: true,
        is_locked: true
      },
      orderBy: { start_date: "desc" }
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: err.message
    });
  }
};

/* =========================
   GET BY ID
========================= */
export const getSchedulePeriodById = async (req, res) => {
  try {
    const period_id = Number(req.params.id);

    const data = await prisma.schedule_periods.findUnique({
      where: { period_id },
      select: {
        period_id: true,
        period_name: true,
        start_date: true,
        end_date: true,
        is_locked: true
      }
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        code: "PERIOD_NOT_FOUND",
        message: "Periode tidak ditemukan"
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: err.message
    });
  }
};

/* =========================
   CREATE
========================= */
export const createSchedulePeriod = async (req, res) => {
  try {
    const { period_name, start_date, end_date } = req.body;

    if (!period_name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "period_name, start_date, end_date wajib diisi"
      });
    }

    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_DATE_RANGE",
        message: "start_date harus lebih kecil dari end_date"
      });
    }

    // ❗ Cek overlap
    const overlap = await prisma.schedule_periods.findFirst({
      where: {
        OR: [
          {
            start_date: { lte: new Date(end_date) },
            end_date: { gte: new Date(start_date) }
          }
        ]
      }
    });

    if (overlap) {
      return res.status(409).json({
        success: false,
        code: "PERIOD_OVERLAP",
        message: "Periode bertabrakan dengan periode lain"
      });
    }

    const data = await prisma.schedule_periods.create({
      data: {
        period_name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        created_by: req.user.user_id
      }
    });

    res.status(201).json({
      success: true,
      code: "PERIOD_CREATED",
      message: "Periode berhasil dibuat",
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: err.message
    });
  }
};

/* =========================
   UPDATE
========================= */
export const updateSchedulePeriod = async (req, res) => {
  try {
    const period_id = Number(req.params.id);
    const { period_name, start_date, end_date, is_locked } = req.body;

    const exist = await prisma.schedule_periods.findUnique({
      where: { period_id }
    });

    if (!exist) {
      return res.status(404).json({
        success: false,
        code: "PERIOD_NOT_FOUND"
      });
    }

    if (exist.is_locked) {
      return res.status(403).json({
        success: false,
        code: "PERIOD_LOCKED",
        message: "Periode sudah dikunci"
      });
    }

    const updated = await prisma.schedule_periods.update({
      where: { period_id },
      data: {
        period_name: period_name ?? exist.period_name,
        start_date: start_date ? new Date(start_date) : exist.start_date,
        end_date: end_date ? new Date(end_date) : exist.end_date,
        is_locked: typeof is_locked === "boolean" ? is_locked : exist.is_locked
      }
    });

    res.json({
      success: true,
      code: "PERIOD_UPDATED",
      message: "Periode berhasil diperbarui",
      data: updated
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: err.message
    });
  }
};

/* =========================
   DELETE
========================= */
export const deleteSchedulePeriod = async (req, res) => {
  try {
    const period_id = Number(req.params.id);

    const exist = await prisma.schedule_periods.findUnique({
      where: { period_id }
    });

    if (!exist) {
      return res.status(404).json({
        success: false,
        code: "PERIOD_NOT_FOUND"
      });
    }

    if (exist.is_locked) {
      return res.status(403).json({
        success: false,
        code: "PERIOD_LOCKED",
        message: "Periode terkunci, tidak bisa dihapus"
      });
    }

    await prisma.schedule_periods.delete({
      where: { period_id }
    });

    res.json({
      success: true,
      code: "PERIOD_DELETED",
      message: "Periode berhasil dihapus"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: err.message
    });
  }
};



export const lockSchedulePeriod = async (req, res) => {
  try {
    const periodId = Number(req.params.id);

    /* =====================
       1. Ambil periode
    ====================== */
    const period = await prisma.schedule_periods.findUnique({
      where: { period_id: periodId }
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        message: "Periode tidak ditemukan"
      });
    }

    if (period.is_locked) {
      return res.status(400).json({
        success: false,
        message: "Periode sudah terkunci"
      });
    }

    /* =====================
       2. Ambil semua tanggal periode
    ====================== */
    const periodDates = getDatesBetween(
      period.start_date,
      period.end_date
    ).map(d => d.toISOString().slice(0, 10));

    /* =====================
       3. Ambil semua jadwal di periode tsb
    ====================== */
    const schedules = await prisma.user_shift_schedules.findMany({
      where: {
        period_id: periodId
      },
      include: {
        user: {
          select: {
            user_id: true,
            display_name: true
          }
        }
      }
    });

    if (schedules.length === 0) {
      return res.status(422).json({
        success: false,
        message: "Tidak bisa lock: jadwal belum diinput"
      });
    }

    /* =====================
       4. Group jadwal per user
    ====================== */
    const userMap = {};

    for (const s of schedules) {
      const dateKey = s.schedule_date.toISOString().slice(0, 10);

      if (!userMap[s.user_id]) {
        userMap[s.user_id] = {
          user_id: s.user.user_id,
          name: s.user.display_name,
          dates: new Set()
        };
      }

      userMap[s.user_id].dates.add(dateKey);
    }

    /* =====================
       5. Cari tanggal yang kosong
    ====================== */
    const errors = [];

    for (const userId in userMap) {
      const filledDates = userMap[userId].dates;

      const missingDates = periodDates.filter(
        d => !filledDates.has(d)
      );

      if (missingDates.length > 0) {
        errors.push({
          user_id: Number(userId),
          name: userMap[userId].name,
          missing_dates: missingDates
        });
      }
    }

    /* =====================
       6. Kalau ada yg kosong → GAGAL LOCK
    ====================== */
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: "Jadwal belum lengkap, periode tidak bisa dikunci",
        errors
      });
    }

    /* =====================
       7. LOCK PERIOD
    ====================== */
    await prisma.schedule_periods.update({
      where: { period_id: periodId },
      data: { is_locked: true }
    });

    res.json({
      success: true,
      message: "Periode berhasil dikunci"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
