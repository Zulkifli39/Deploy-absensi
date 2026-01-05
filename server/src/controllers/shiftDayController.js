import { prisma } from "../../config/prisma.js";

export const createShiftDay = async (req, res) => {
  try {
    const {
      shift_id,
      day_of_week,
      checkin_time,
      checkout_time,
      tolerance_time,
      is_next_day
    } = req.body;

    const data = await prisma.shift_days.create({
      data: {
        shift_id,
        day_of_week,
        checkin_time,
        checkout_time,
        tolerance_time,
        is_next_day,
        created_at: new Date()
      }
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
