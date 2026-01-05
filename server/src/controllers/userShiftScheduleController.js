import XLSX from "xlsx";
import { prisma } from "../../config/prisma.js";
import { ROLES } from "../middleware/roles.js";


//Ambil Periode
const getPeriodOrThrow = async (period_id) => {
  const period = await prisma.schedule_periods.findUnique({
    where: { period_id: parseInt(period_id) }
  });

  if (!period) {
    throw new Error("Periode tidak ditemukan");
  }

  if (period.is_locked) {
    throw new Error("Periode sudah terkunci");
  }

  return period;
};

const getDatesInRange = (start, end) => {
  const dates = [];
  let current = new Date(start);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const validateFullPeriodFilled = (period, schedules) => {
  const requiredDates = getDatesInRange(
    period.start_date,
    period.end_date
  );

  const payloadDates = schedules.map(
    s => new Date(s.date).toISOString().split("T")[0]
  );

  const missingDates = requiredDates.filter(
    date => !payloadDates.includes(date)
  );

  if (missingDates.length > 0) {
    throw new Error(
      `Jadwal harus terisi penuh. Tanggal yang belum diisi: ${missingDates.join(", ")}`
    );
  }
};

const validateUsersFullPeriod = (period, users) => {
  const requiredDates = getDatesInRange(
    period.start_date,
    period.end_date
  );

  const errors = [];

  for (const user of users) {
    const cleanSchedules = user.schedules.filter(
      s => s?.date && s?.shift_id
    );

    const payloadDates = cleanSchedules.map(
      s => new Date(s.date).toISOString().split("T")[0]
    );

    const missingDates = requiredDates.filter(
      d => !payloadDates.includes(d)
    );

    if (missingDates.length > 0) {
      errors.push({
        user_id: user.user_id,
        missing_dates: missingDates
      });
    }
  }

  return errors;
};

// Helper function untuk cek periode terkunci
const isPeriodLocked = async (period_id) => {
  const period = await prisma.schedule_periods.findUnique({
    where: { period_id: parseInt(period_id) }
  });
  return period && period.is_locked;
};

//  CREATE USER SHIFT SCHEDULE
export const createUserShiftSchedule = async (req, res) => {
  const { period_id } = req.params;
  const { user_id, shift_id, schedule_date } = req.body;

  try {
    if (!user_id || !shift_id || !schedule_date) {
      return res.status(400).json({
        success: false,
        message: "user_id, shift_id, schedule_date wajib diisi"
      });
    }

    // Validasi jika periode sudah terkunci
    if (await isPeriodLocked(period_id)) {
      return res.status(403).json({
        success: false,
        message: "Periode sudah terkunci, tidak bisa mengubah jadwal"
      });
    }

    // Validasi format tanggal
    const validDate = new Date(schedule_date);
    if (isNaN(validDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal tidak valid"
      });
    }

    // Memastikan jadwal tidak duplikat
    const existingSchedule = await prisma.user_shift_schedules.findUnique({
      where: {
        user_id_schedule_date: {
          user_id: parseInt(user_id),
          schedule_date: validDate
        }
      }
    });

    if (existingSchedule) {
      return res.status(409).json({
        success: false,
        message: "User sudah memiliki jadwal pada tanggal ini"
      });
    }

    // Menambah jadwal shift
    const newSchedule = await prisma.user_shift_schedules.create({
      data: {
        period_id: parseInt(period_id),
        user_id: parseInt(user_id),
        shift_id: parseInt(shift_id),
        schedule_date: validDate
      }
    });

    res.status(201).json({
      success: true,
      message: "Jadwal shift berhasil dibuat",
      data: newSchedule
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: `Terjadi kesalahan server: ${err.message}`
    });
  }
};

// BULK CREATE USER SHIFT SCHEDULE - STRICT
export const bulkCreateUserShiftSchedule = async (req, res) => {
  const { period_id } = req.params;
  const { user_id, schedules } = req.body;

  try {
    if (!user_id || !Array.isArray(schedules)) {
      return res.status(400).json({
        success: false,
        message: "user_id dan schedules wajib diisi"
      });
    }

    const period = await getPeriodOrThrow(period_id);

    // Bersihkan data kosong
    const cleanSchedules = schedules.filter(
      s => s?.date && s?.shift_id
    );

    // ðŸ”´ WAJIB FULL 1 PERIODE
    validateFullPeriodFilled(period, cleanSchedules);

    // Normalisasi tanggal
    const normalizedDates = cleanSchedules.map(s =>
      new Date(s.date).toISOString().split("T")[0]
    );

    // Cegah duplikat tanggal
    if (new Set(normalizedDates).size !== normalizedDates.length) {
      return res.status(409).json({
        success: false,
        message: "Terdapat tanggal duplikat di payload"
      });
    }

    // Cek ke DB (karena CREATE)
    const existing = await prisma.user_shift_schedules.findMany({
      where: {
        user_id: parseInt(user_id),
        period_id: parseInt(period_id)
      }
    });

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Jadwal untuk user ini di periode ini sudah ada"
      });
    }

    const data = cleanSchedules.map(item => ({
      period_id: parseInt(period_id),
      user_id: parseInt(user_id),
      shift_id: parseInt(item.shift_id),
      schedule_date: new Date(item.date)
    }));

    await prisma.user_shift_schedules.createMany({ data });

    res.status(201).json({
      success: true,
      message: "Jadwal 1 periode berhasil dibuat penuh",
      total_days: data.length
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const bulkMultiUserFullPeriod = async (req, res) => {
  const { period_id } = req.params;
  const { users } = req.body;

  try {
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "users wajib diisi"
      });
    }

    const period = await getPeriodOrThrow(period_id);

    // 1ï¸âƒ£ VALIDASI FULL PER USER (KUMPULKAN SEMUA ERROR)
    const validationErrors = validateUsersFullPeriod(period, users);

    if (validationErrors.length > 0) {
      return res.status(422).json({
        success: false,
        message: "Validasi jadwal gagal",
        errors: validationErrors
      });
    }

    const allInsertData = [];

    // 2ï¸âƒ£ VALIDASI DUPLIKAT + PREPARE DATA
    for (const user of users) {
      const cleanSchedules = user.schedules.filter(
        s => s?.date && s?.shift_id
      );

      const normalizedDates = cleanSchedules.map(
        s => new Date(s.date).toISOString().split("T")[0]
      );

      if (new Set(normalizedDates).size !== normalizedDates.length) {
        return res.status(409).json({
          success: false,
          message: `User ${user.user_id} memiliki tanggal duplikat`
        });
      }

      for (const item of cleanSchedules) {
        allInsertData.push({
          period_id: parseInt(period_id),
          user_id: parseInt(user.user_id),
          shift_id: parseInt(item.shift_id),
          schedule_date: new Date(item.date)
        });
      }
    }

    // 3ï¸âƒ£ TRANSACTION (ALL OR NOTHING)
    await prisma.$transaction(async tx => {
      await tx.user_shift_schedules.deleteMany({
        where: { period_id: parseInt(period_id) }
      });

      await tx.user_shift_schedules.createMany({
        data: allInsertData
      });
    });

    res.status(201).json({
      success: true,
      message: "Semua jadwal user berhasil disimpan penuh",
      total_users: users.length,
      total_records: allInsertData.length
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// GET USER SHIFT SCHEDULES (GET PER USER)
export const getUserShiftSchedules = async (req, res) => {
  const { period_id } = req.params;
  const { user_role_id, user_id } = req.user;

  try {
    const where = {
        period_id: parseInt(period_id)
    };

    // Jika bukan Admin / Kepala Instalasi, hanya bisa lihat jadwal sendiri
    if (
        user_role_id !== ROLES.ADMIN &&
        user_role_id !== ROLES.KEPALA_INSTALASI &&
        user_role_id !== ROLES.KEPALA_SUB_INSTALASI
    ) {
        where.user_id = user_id;
    }

    const schedules = await prisma.user_shift_schedules.findMany({
      where: where,
      include: {
        user: { select: { display_name: true } },
        shift: { select: { shift_name: true } }
      }
    });

    res.json({
      success: true,
      data: schedules
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// UPDATE USER SHIFT SCHEDULE
export const updateUserShiftSchedule = async (req, res) => {
  const { period_id, schedule_id } = req.params;
  const { user_id, shift_id, schedule_date } = req.body;

  try {
    const schedule = await prisma.user_shift_schedules.findUnique({
      where: { user_shift_schedule_id: parseInt(schedule_id) }
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan"
      });
    }

    // Cek apakah periode sudah terkunci
    const period = await prisma.schedule_periods.findUnique({
      where: { period_id: parseInt(period_id) }
    });

    if (period && period.is_locked) {
      return res.status(403).json({
        success: false,
        message: "Periode sudah terkunci, tidak bisa mengubah jadwal"
      });
    }

    // Update jadwal shift
    const updatedSchedule = await prisma.user_shift_schedules.update({
      where: { user_shift_schedule_id: parseInt(schedule_id) },
      data: {
        user_id: user_id ?? schedule.user_id,
        shift_id: shift_id ?? schedule.shift_id,
        schedule_date: schedule_date ? new Date(schedule_date) : schedule.schedule_date
      }
    });

    res.json({
      success: true,
      message: "Jadwal berhasil diperbarui",
      data: updatedSchedule
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// BULK EDIT (REPLACE) USER SHIFT SCHEDULE - STRICT
export const bulkEditUserShiftSchedule = async (req, res) => {
  const { period_id } = req.params;
  const { user_id, schedules } = req.body;

  try {
    if (!user_id || !Array.isArray(schedules)) {
      return res.status(400).json({
        success: false,
        message: "user_id dan schedules wajib diisi"
      });
    }

    const period = await getPeriodOrThrow(period_id);

    // 1ï¸âƒ£ Bersihkan data kosong
    const cleanSchedules = schedules.filter(
      s => s?.date && s?.shift_id
    );

    if (cleanSchedules.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada jadwal valid untuk disimpan"
      });
    }

    // 2ï¸âƒ£ Normalisasi tanggal
    const normalizedDates = cleanSchedules.map(s =>
      new Date(s.date).toISOString().split("T")[0]
    );

    // 3ï¸âƒ£ Validasi duplikat tanggal di payload
    const duplicateDates = normalizedDates.filter(
      (date, index, arr) => arr.indexOf(date) !== index
    );

    if (duplicateDates.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Terdapat tanggal duplikat di payload",
        dates: [...new Set(duplicateDates)]
      });
    }

    // 4ï¸âƒ£ Mapping + validasi final
    const data = cleanSchedules.map(item => {
      const date = new Date(item.date);
      if (isNaN(date.getTime())) {
        throw new Error(`Tanggal tidak valid: ${item.date}`);
      }

      if (date < period.start_date || date > period.end_date) {
        throw new Error(`Tanggal ${item.date} di luar periode`);
      }

      const shiftId = parseInt(item.shift_id);
      if (isNaN(shiftId)) {
        throw new Error(`shift_id tidak valid pada tanggal ${item.date}`);
      }

      return {
        period_id: parseInt(period_id),
        user_id: parseInt(user_id),
        shift_id: shiftId,
        schedule_date: date
      };
    });

    // 5ï¸âƒ£ TRANSACTION (REPLACE TOTAL)
    await prisma.$transaction(async tx => {
      // hapus jadwal lama user di periode ini
      await tx.user_shift_schedules.deleteMany({
        where: {
          period_id: parseInt(period_id),
          user_id: parseInt(user_id)
        }
      });

      // insert ulang
      await tx.user_shift_schedules.createMany({
        data
      });
    });

    res.json({
      success: true,
      message: "Jadwal berhasil diperbarui",
      inserted: data.length
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
export const previewScheduleFromExcel = async (req, res) => {
  const { period_id } = req.params;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File Excel wajib diupload"
      });
    }

    // 1ï¸âƒ£ validasi periode
    const period = await getPeriodOrThrow(period_id);

    // 2ï¸âƒ£ department & sub-department dari user login
    const {
      department_id: departmentId,
      sub_department_id: subDepartmentId
    } = req.user || {};

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department tidak ditemukan"
      });
    }

    // 3ï¸âƒ£ ambil shift sesuai department
    const shifts = await prisma.shifts.findMany({
      where: { department_id: departmentId },
      select: {
        shift_id: true,
        shift_code: true
      }
    });

    const shiftMap = {};
    shifts.forEach(s => {
      shiftMap[s.shift_code.trim()] = s;
    });

    // 4ï¸âƒ£ ambil user sesuai scope login
    const userWhere = { department_id: departmentId };
    if (subDepartmentId) {
      userWhere.sub_department_id = subDepartmentId;
    }

    const usersDb = await prisma.users.findMany({
      where: userWhere,
      select: { user_id: true }
    });

    const validUserIds = new Set(usersDb.map(u => u.user_id));

    // 5ï¸âƒ£ parse excel
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets["Schedule"];
    if (!sheet) throw new Error("Sheet 'Schedule' tidak ditemukan");

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const [header, ...body] = rows;

    // SESUAI TEMPLATE:
    // user_id | display_name | department_name | tanggal...
    const dateHeaders = header.slice(3);

    const usersPayload = [];
    const errors = [];

    for (const row of body) {
      const user_id = parseInt(row[0]);

      if (!validUserIds.has(user_id)) {
        errors.push({
          user_id,
          error: "User tidak ditemukan atau di luar scope department"
        });
        continue;
      }

      const schedules = [];

      dateHeaders.forEach((date, idx) => {
        const shiftCode = row[idx + 3]?.toString().trim();
        if (!shiftCode) return;

        const shift = shiftMap[shiftCode];
        if (!shift) {
          errors.push({
            user_id,
            date,
            error: `Shift code tidak valid: ${shiftCode}`
          });
          return;
        }

        schedules.push({
          date,
          shift_code: shiftCode,   // ðŸ”¥ UNTUK PREVIEW
          shift_id: shift.shift_id // disimpan internal
        });
      });

      usersPayload.push({ user_id, schedules });
    }

    // 6ï¸âƒ£ error parsing
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: "Validasi Excel gagal",
        errors
      });
    }

    // 7ï¸âƒ£ validasi full periode
    const fullErrors = validateUsersFullPeriod(period, usersPayload);
    if (fullErrors.length > 0) {
      return res.status(422).json({
        success: false,
        message: "Validasi full periode gagal",
        errors: fullErrors
      });
    }

    /* ======================
       ðŸ” PREVIEW DETAIL (OPSI 3)
    ====================== */
    const totalDays = dateHeaders.length;

    const previewUsers = usersPayload.map(u => ({
      user_id: u.user_id,
      schedules: u.schedules.map(s => ({
        date: s.date,
        shift_code: s.shift_code
      }))
    }));

    return res.json({
      success: true,
      message: "Preview berhasil",
      summary: {
        total_users: usersPayload.length,
        total_days: totalDays,
        total_records: previewUsers.reduce(
          (sum, u) => sum + u.schedules.length,
          0
        )
      },
      users: previewUsers
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};



export const uploadScheduleFromExcel = async (req, res) => {
  const { period_id } = req.params;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File Excel wajib diupload"
      });
    }


    const period = await getPeriodOrThrow(period_id);


    const {
      department_id: departmentId,
      sub_department_id: subDepartmentId
    } = req.user || {};

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department tidak ditemukan"
      });
    }


    const shifts = await prisma.shifts.findMany({
      where: { department_id: departmentId },
      select: {
        shift_id: true,
        shift_code: true
      }
    });

    const shiftMap = {};
    shifts.forEach(s => {
      shiftMap[s.shift_code.trim()] = s;
    });


    const userWhere = { department_id: departmentId };
    if (subDepartmentId) {
      userWhere.sub_department_id = subDepartmentId;
    }

    const usersDb = await prisma.users.findMany({
      where: userWhere,
      select: { user_id: true }
    });

    const validUserIds = new Set(usersDb.map(u => u.user_id));


    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets["Schedule"];
    if (!sheet) throw new Error("Sheet 'Schedule' tidak ditemukan");

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const [header, ...body] = rows;


    const dateHeaders = header.slice(3);

    const usersPayload = [];
    const errors = [];

    for (const row of body) {
      const user_id = parseInt(row[0]);

      if (!validUserIds.has(user_id)) {
        errors.push({
          user_id,
          error: "User tidak ditemukan atau di luar scope department"
        });
        continue;
      }

      const schedules = [];

      dateHeaders.forEach((date, idx) => {
        const shiftCode = row[idx + 3]?.toString().trim();
        if (!shiftCode) return;

        const shift = shiftMap[shiftCode];
        if (!shift) {
          errors.push({
            user_id,
            date,
            error: `Shift code tidak valid: ${shiftCode}`
          });
          return;
        }

        schedules.push({
          date,
          shift_id: shift.shift_id
        });
      });

      usersPayload.push({ user_id, schedules });
    }


    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: "Validasi Excel gagal",
        errors
      });
    }


    const fullErrors = validateUsersFullPeriod(period, usersPayload);
    if (fullErrors.length > 0) {
      return res.status(422).json({
        success: false,
        message: "Validasi full periode gagal",
        errors: fullErrors
      });
    }


    const insertData = [];
    for (const user of usersPayload) {
      for (const s of user.schedules) {
        insertData.push({
          period_id: parseInt(period_id),
          user_id: user.user_id,
          shift_id: s.shift_id,
          schedule_date: new Date(s.date)
        });
      }
    }


    await prisma.$transaction(async tx => {
      await tx.user_shift_schedules.deleteMany({
        where: { period_id: parseInt(period_id) }
      });

      await tx.user_shift_schedules.createMany({
        data: insertData
      });
    });

    return res.status(201).json({
      success: true,
      message: "Upload jadwal Excel berhasil",
      total_users: usersPayload.length,
      total_records: insertData.length
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


export const downloadScheduleTemplate = async (req, res) => {
  const { period_id } = req.params;

  try {

    const period = await getPeriodOrThrow(period_id);


    const {
      department_id: departmentId,
      department_name: departmentName,
      sub_department_id: subDepartmentId,
      sub_department_name: subDepartmentName
    } = req.user || {};

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department tidak ditemukan pada user login"
      });
    }

    const userWhere = {
      department_id: departmentId
    };

    if (subDepartmentId) {
      userWhere.sub_department_id = subDepartmentId;
    }

    const users = await prisma.users.findMany({
      where: userWhere,
      select: {
        user_id: true,
        display_name: true
      },
      orderBy: { display_name: "asc" }
    });

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada user sesuai scope department"
      });
    }


    const shifts = await prisma.shifts.findMany({
      where: { department_id: departmentId },
      select: {
        shift_code: true,
        shift_name: true,
        checkin_time: true,
        checkout_time: true
      },
      orderBy: { shift_code: "asc" }
    });

    if (shifts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Shift belum tersedia untuk department ini"
      });
    }

    const dates = [];
    let current = new Date(period.start_date);
    while (current <= period.end_date) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    const scheduleHeader = [
      "user_id",
      "display_name",
      "department_name",
      ...dates
    ];

    const scheduleRows = users.map(u => [
      u.user_id,
      u.display_name,
      subDepartmentName
        ? `${departmentName} - ${subDepartmentName}`
        : departmentName,
      ...dates.map(() => "")
    ]);

    const scheduleSheet = XLSX.utils.aoa_to_sheet([
      scheduleHeader,
      ...scheduleRows
    ]);


    const shiftHeader = [
      "shift_code",
      "shift_name",
      "checkin_time",
      "checkout_time"
    ];

    const shiftRows = shifts.map(s => [
      s.shift_code,
      s.shift_name,
      s.checkin_time,
      s.checkout_time
    ]);

    const shiftSheet = XLSX.utils.aoa_to_sheet([
      shiftHeader,
      ...shiftRows
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, scheduleSheet, "Schedule");
    XLSX.utils.book_append_sheet(workbook, shiftSheet, "Shift_List");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx"
    });


    const safeDept = departmentName.replace(/\s+/g, "_");
    const safeSubDept = subDepartmentName
      ? subDepartmentName.replace(/\s+/g, "_")
      : null;

    const fileName = safeSubDept
      ? `template_jadwal_${safeDept}_${safeSubDept}_${period.period_name}.xlsx`
      : `template_jadwal_${safeDept}_${period.period_name}.xlsx`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);

  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};