import { prisma } from "../../config/prisma.js";

export const getLeaveRequests = async (req, res) => {
  try {
    const data = await prisma.leave_requests.findMany({
      include: {
        user: true,
        leave_type: true
      }
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getLeaveRequestById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const item = await prisma.leave_requests.findUnique({
      where: { leave_id: id },
      include: {
        user: true,
        leave_type: true
      }
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Leave request tidak ditemukan" });
    }

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const createLeaveRequest = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { leave_type_id, start_date, end_date, description, attachment_url } = req.body;

    // Cek type cuti
    const type = await prisma.leave_types.findUnique({
      where: { leave_type_id }
    });

    if (!type || !type.is_active) {
      return res.status(400).json({ success: false, message: "Jenis cuti tidak valid" });
    }

    // Validasi attachment jika perlu
    if (type.requires_attachment && !attachment_url) {
      return res.status(400).json({
        success: false,
        message: "Jenis cuti ini membutuhkan lampiran"
      });
    }

    // Cek overlap date
    const overlap = await prisma.leave_requests.findFirst({
      where: {
        user_id,
        status: { in: ["pending", "approved"] },
        OR: [
          {
            start_date: { lte: new Date(end_date) },
            end_date: { gte: new Date(start_date) }
          }
        ]
      }
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: "Anda sudah memiliki pengajuan pada tanggal ini"
      });
    }

    const leave = await prisma.leave_requests.create({
      data: {
        user_id,
        leave_type_id,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        description,
        attachment_url,
        status: "pending",
        created_at: new Date()
      }
    });

    res.json({ success: true, message: "Pengajuan cuti berhasil dibuat", data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const approveLeave = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const admin_id = req.user.user_id;

    const request = await prisma.leave_requests.findUnique({
      where: { leave_id: id }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });
    }

    const updated = await prisma.leave_requests.update({
      where: { leave_id: id },
      data: {
        status: "approved",
        approved_by: admin_id,
        approved_at: new Date(),
        updated_at: new Date()
      }
    });

    res.json({ success: true, message: "Pengajuan disetujui", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const rejectLeave = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rejection_reason } = req.body;
    const admin_id = req.user.user_id;

    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: "Alasan penolakan wajib diisi"
      });
    }

    const updated = await prisma.leave_requests.update({
      where: { leave_id: id },
      data: {
        status: "rejected",
        rejection_reason,
        approved_by: admin_id,
        approved_at: new Date(),
        updated_at: new Date()
      }
    });

    res.json({ success: true, message: "Pengajuan ditolak", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
