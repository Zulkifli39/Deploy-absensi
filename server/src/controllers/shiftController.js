import { prisma } from "../../config/prisma.js";

/**
 * GET all shifts
 */
export const getShifts = async (req, res) => {
  try {
    const shifts = await prisma.shifts.findMany({
      orderBy: { created_at: "desc" }
    });

    res.json({ success: true, data: shifts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// export const getShifts = async (req, res) => {
//   try {
//     const { department_id } = req.query;

//     const shifts = await prisma.shifts.findMany({
//       where: department_id
//         ? { department_id: Number(department_id) }
//         : undefined,
//       orderBy: { created_at: "desc" }
//     });

//     res.json({ success: true, data: shifts });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


/**
 * GET shift by ID
 */
export const getShiftById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const shift = await prisma.shifts.findUnique({
      where: { shift_id: id }
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift tidak ditemukan"
      });
    }

    res.json({ success: true, data: shift });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * CREATE shift
 */
export const createShift = async (req, res) => {
  try {
    const {
      shift_code,
      department_id,
      shift_name,
      shift_type,
      checkin_time,
      checkout_time,
      is_next_day
    } = req.body;

    if (!shift_code || !shift_name || !checkin_time || !checkout_time) {
      return res.status(400).json({
        success: false,
        message: "Data shift belum lengkap"
      });
    }

    const exist = await prisma.shifts.findUnique({
      where: { shift_code }
    });

    if (exist) {
      return res.status(409).json({
        success: false,
        message: "Shift code sudah digunakan"
      });
    }

    const shift = await prisma.shifts.create({
      data: {
        shift_code,
        shift_name,
        shift_type,
        department_id,
        checkin_time,
        checkout_time,
        is_next_day: !!is_next_day
      }
    });

    res.json({
      success: true,
      message: "Shift berhasil dibuat",
      data: shift
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE shift
 */
export const updateShift = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.shifts.findUnique({
      where: { shift_id: id }
    });

    if (!exist) {
      return res.status(404).json({
        success: false,
        message: "Shift tidak ditemukan"
      });
    }

    const {
      shift_code,
      shift_name,
      shift_type,
      department_id,
      checkin_time,
      checkout_time,
      is_next_day
    } = req.body;

    const updated = await prisma.shifts.update({
      where: { shift_id: id },
      data: {
        shift_code: shift_code ?? exist.shift_code,
        shift_name: shift_name ?? exist.shift_name,
        shift_type: shift_type ?? exist.shift_type,
        department_id: department_id ?? exist.department_id,
        checkin_time: checkin_time ?? exist.checkin_time,
        checkout_time: checkout_time ?? exist.checkout_time,
        is_next_day:
          typeof is_next_day === "boolean"
            ? is_next_day
            : exist.is_next_day
      }
    });

    res.json({
      success: true,
      message: "Shift berhasil diperbarui",
      data: updated
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE shift (hard delete)
 */
export const deleteShift = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.shifts.findUnique({
      where: { shift_id: id }
    });

    if (!exist) { 
      return res.status(404).json({
        success: false,
        message: "Shift tidak ditemukan"
      });
    }

    await prisma.shifts.delete({
      where: { shift_id: id }
    });

    res.json({
      success: true,
      message: "Shift berhasil dihapus"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
