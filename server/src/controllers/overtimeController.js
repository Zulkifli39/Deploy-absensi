import { prisma } from "../../config/prisma.js";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { addTextAndCompressImage } from "../utils/photoUtils.js";
process.env.TZ = 'Asia/<Makassar>';

export const startOvertime = async (req, res) => { 
  try {

    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { reason, latitude, longitude } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason wajib diisi"
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Foto wajib diambil"
      });
    }

    const nowReal = new Date(); // waktu server lokal

    const start_photo_url = await addTextAndCompressImage(
      req.file.buffer,
      req.user.display_name,
      Number(latitude),
      Number(longitude),
      nowReal,              // 🔥 TANPA TZ
      "overtime_start"
    );

    const overtime = await prisma.overtime_requests.create({
      data: {
        user_id,
        department_id: req.user.department_id,
        start_time: nowReal,     // 🔥 pakai waktu server
        total_minutes: 0,
        reason,
        start_photo: start_photo_url
      }
    });

    return res.status(201).json({
      success: true,
      message: "Overtime berhasil dimulai",
      data: overtime
    });

  } catch (err) {
    console.error("START OVERTIME ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const endOvertime = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID overtime tidak valid"
      });
    }
    const { latitude, longitude } = req.body;
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Foto wajib diambil"
      });
    }
    const overtime = await prisma.overtime_requests.findUnique({
      where: { overtime_id: Number(id) }
    });

    if (!overtime) {
      return res.status(404).json({
        success: false,
        message: "Data overtime tidak ditemukan"
      });
    }

    if (overtime.end_time) {
      return res.status(400).json({
        success: false,
        message: "Overtime sudah diselesaikan"
      });
    }
    const nowReal = new Date(); // waktu server saat end
    const totalMinutes = Math.floor(
      (nowReal.getTime() - new Date(overtime.start_time).getTime()) / 60000
    );

    if (totalMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: "Durasi overtime tidak valid"
      });
    }
    const end_photo_url = await addTextAndCompressImage(
      req.file.buffer,
      req.user.display_name,
      Number(latitude),
      Number(longitude),
      nowReal,              // 🔥 TANPA TZ
      "overtime_end"
    );
    const updatedOvertime = await prisma.overtime_requests.update({
      where: { overtime_id: Number(id) },
      data: {
        end_time: nowReal,        // 🔥 pakai waktu server
        total_minutes: totalMinutes,
        end_photo: end_photo_url
      }
    });

    return res.json({
      success: true,
      message: "Overtime berhasil diselesaikan",
      data: updatedOvertime
    });

  } catch (err) {
    console.error("END OVERTIME ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



export const approveOvertime = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status harus APPROVED atau REJECTED"
      });
    }

    const overtime = await prisma.overtime_requests.findUnique({
      where: { overtime_id: parseInt(id) }
    });

    if (!overtime) {
      return res.status(404).json({
        success: false,
        message: "Data overtime tidak ditemukan"
      });
    }

    // 🔥 VALIDASI BARU: BELUM END → TIDAK BOLEH APPROVE
    if (!overtime.end_time) {
      return res.status(400).json({
        success: false,
        message: "Overtime belum diselesaikan, tidak bisa di-approve"
      });
    }

    // 🔒 OPTIONAL: cegah approve ulang
    if (overtime.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Overtime sudah ${overtime.status.toLowerCase()}`
      });
    }

    const updated = await prisma.overtime_requests.update({
      where: { overtime_id: parseInt(id) },
      data: {
        status,
        approved_by: req.user.user_id,
        approved_at: new Date()
      }
    });

    return res.json({
      success: true,
      message: `Overtime berhasil ${status.toLowerCase()}`,
      data: updated
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

