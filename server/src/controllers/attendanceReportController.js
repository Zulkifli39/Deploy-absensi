import ExcelJS from "exceljs";
import { prisma } from "../../config/prisma.js";
import { ROLES } from "../middleware/roles.js";

const formatTime = (time) => {
  if (!time) return "X";
  return new Date(time).toISOString().slice(11, 16);
};

const calcTotalHours = (inTime, outTime) => {
  if (!inTime || !outTime) return 0;
  return (((new Date(outTime).getTime() - new Date(inTime).getTime()) / 3600000)).toFixed(2);
};

const sanitizeFilename = (name) => {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_")
    .trim();
};  

export const downloadAttendanceReport = async (req, res) => {
  try {
    const { period_id } = req.query;

    if (!period_id) {
      return res.status(400).json({
        success: false,
        message: "period_id wajib diisi"
      });
    }

    const {
      id: userId,
      user_role_id,
      department_id,
      sub_department_id
    } = req.user;

    //  VALIDASI PERIODE
    const period = await prisma.schedule_periods.findUnique({
      where: { period_id: Number(period_id) }
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        message: "Periode tidak ditemukan"
      });
    }

    // Role Base Access
    let where = {
      period_id: Number(period_id)
    };

    if (user_role_id === ROLES.KEPALA_INSTALASI) {
      where.user = { department_id };
    }

    if (user_role_id === ROLES.KEPALA_SUB_INSTALASI) {
      where.user = { sub_department_id };
    }

    if (user_role_id === ROLES.STAFF) {
      where.user_id = userId;
    }

    // Fetch Attandance
    const attendances = await prisma.attendances.findMany({
      where,
      orderBy: [
        { attendance_date: "asc" },
        { user_id: "asc" }
      ],
      include: {
        user: {
          select: {
            display_name: true,
            department: {
              select: { department_name: true }
            },
            sub_department: {
              select: { sub_department_name: true }
            }
          }
        },
        shift: {
          select: { shift_name: true }
        },
        period: {
          select: { period_name: true }
        }
      }
    });

    if (!attendances.length) {
      return res.status(404).json({
        success: false,
        message: "Data absensi tidak ditemukan"
      });
    }

    // Group By Sheet
    const groupedData = {};

    attendances.forEach(a => {
      const dept = a.user.department?.department_name || "Tanpa Department";
      const sub = a.user.sub_department?.sub_department_name || "Tanpa Sub";
      const sheetName = `${dept} - ${sub}`.substring(0, 31); // batas Excel

      if (!groupedData[sheetName]) {
        groupedData[sheetName] = [];
      }

      groupedData[sheetName].push(a);
    });

    // Create Excel
    const workbook = new ExcelJS.Workbook();

    Object.entries(groupedData).forEach(([sheetName, data]) => {
    const sheet = workbook.addWorksheet(sheetName);

    // Group By User
    const userMap = {};
    data.forEach(a => {
        if (!userMap[a.user_id]) {
        userMap[a.user_id] = {
            user: a.user,
            shift: a.shift?.shift_name ?? "-",
            records: {}
        };
    }

    const dateKey = a.attendance_date.toISOString().slice(0, 10);
    userMap[a.user_id].records[dateKey] = a;
  });

 
    // List Tanggal
    const allDates = [
        ...new Set(
        data.map(a => a.attendance_date.toISOString().slice(0, 10))
        )
    ].sort();

    sheet.getRow(1).values = [
        "Nama Pegawai",
        "Department",
        "Sub Department",
        "Shift"
    ];

    let colIndex = 5;
    allDates.forEach(date => {
        sheet.mergeCells(1, colIndex, 1, colIndex + 2);
        sheet.getCell(1, colIndex).value = date;
        colIndex += 3;
    });

        sheet.getRow(2).values = [
        "",
        "",
        "",
        ""
    ];

  colIndex = 5;
  allDates.forEach(() => {
    sheet.getRow(2).getCell(colIndex).value = "Jam Mulai";
    sheet.getRow(2).getCell(colIndex + 1).value = "Jam Akhir";
    sheet.getRow(2).getCell(colIndex + 2).value = "Total Jam";
    colIndex += 3;
  });

  //  Style Header
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(2).font = { bold: true };
  sheet.views = [{ state: "frozen", xSplit: 4, ySplit: 2 }];

  // Data Rows
  Object.values(userMap).forEach(u => {
    const row = [
      u.user.display_name,
      u.user.department?.department_name ?? "-",
      u.user.sub_department?.sub_department_name ?? "-",
      u.shift
    ];

    allDates.forEach(date => {
      const att = u.records[date];
      row.push(formatTime(att?.checkin_time));
      row.push(formatTime(att?.checkout_time));
      row.push(calcTotalHours(att?.checkin_time, att?.checkout_time));
    });

    sheet.addRow(row);
  });

    //   Column Width
    sheet.columns.forEach(col => {
        if (!col.width) col.width = 12;
    });
    });


    const filename = `laporan-absensi-${period.period_name}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("DOWNLOAD ATTENDANCE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengunduh laporan absensi"
    });
  }
};

// Generate Reports By ID
export const downloadAttendanceReportById = async (req, res) => {
  try {
    const { period_id, user_id } = req.query;

    if (!period_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "period_id dan user_id wajib diisi"
      });
    }

    const { id: currentUserId, user_role_id, department_id, sub_department_id } = req.user;

    const period = await prisma.schedule_periods.findUnique({
      where: { period_id: Number(period_id) }
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        message: "Periode tidak ditemukan"
      });
    }

    // Validasi akses
    let where = { period_id: Number(period_id), user_id: Number(user_id) };

    if (user_role_id === ROLES.KEPALA_INSTALASI) {
      where.user = { department_id };
    } else if (user_role_id === ROLES.KEPALA_SUB_INSTALASI) {
      where.user = { sub_department_id };
    } else if (user_role_id === ROLES.STAFF && currentUserId !== Number(user_id)) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke laporan user lain"
      });
    }

    const attendances = await prisma.attendances.findMany({
      where,
      orderBy: [{ attendance_date: "asc" }],
      include: {
        shift: { select: { shift_name: true } },
        user: {
          select: {
            display_name: true,
            department: { select: { department_name: true } },
            sub_department: { select: { sub_department_name: true } },
          }
        },
      }
    });

    if (!attendances.length) {
      return res.status(404).json({
        success: false,
        message: "Data absensi tidak ditemukan"
      });
    }

    const workbook = new ExcelJS.Workbook();
    const userName = attendances[0].user.display_name.substring(0, 31);
    const sheet = workbook.addWorksheet(userName);

    // Header
    sheet.addRow([
      "Nama Pegawai",
      "Department",
      "Sub Department",
      "Shift",
      "Tanggal",
      "Jam Mulai",
      "Jam Akhir",
      "Total Jam"
    ]);
    sheet.getRow(1).font = { bold: true };

    // Data rows
    attendances.forEach(a => {
      sheet.addRow([
        a.user.display_name,
        a.user.department?.department_name ?? "-",
        a.user.sub_department?.sub_department_name ?? "-",
        a.shift?.shift_name ?? "-",
        a.attendance_date.toISOString().slice(0, 10),
        formatTime(a.checkin_time),
        formatTime(a.checkout_time),
        calcTotalHours(a.checkin_time, a.checkout_time),
      ]);
    });

    // Column width
    sheet.columns.forEach(col => { if (!col.width) col.width = 18; });

    // Write Excel
    const filename = `laporan-absensi-${userName}-${period.period_name}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("DOWNLOAD ATTENDANCE BY ID ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengunduh laporan absensi"
    });
  }
};

// Generate By Range Date
export const downloadAttendanceReportByDateRange = async (req, res) => {
  try {
    const { period_id, start_date, end_date } = req.query;

    if (!period_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "period_id, start_date, dan end_date wajib diisi"
      });
    }

    const {
      id: userId,
      user_role_id,
      department_id,
      sub_department_id
    } = req.user;

    // Validasi periode
    const period = await prisma.schedule_periods.findUnique({
      where: { period_id: Number(period_id) }
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        message: "Periode tidak ditemukan"
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999);

    let where = {
      period_id: Number(period_id),
      attendance_date: {
        gte: startDate,
        lte: endDate
      }
    };

    // Role-based access
    if (user_role_id === ROLES.KEPALA_INSTALASI) {
      where.user = { department_id };
    }

    if (user_role_id === ROLES.KEPALA_SUB_INSTALASI) {
      where.user = { sub_department_id };
    }

    if (user_role_id === ROLES.STAFF) {
      where.user_id = userId;
    }

    /* =====================
       FETCH DATA
    ===================== */
    const attendances = await prisma.attendances.findMany({
      where,
      orderBy: [
        { attendance_date: "asc" },
        { user_id: "asc" }
      ],
      include: {
        user: {
          select: {
            display_name: true,
            department: { select: { department_name: true } },
            sub_department: { select: { sub_department_name: true } }
          }
        },
        shift: { select: { shift_name: true } }
      }
    });

    if (!attendances.length) {
      return res.status(404).json({
        success: false,
        message: "Data absensi tidak ditemukan pada rentang tanggal tersebut"
      });
    }

    /* =====================
       GROUP BY DEPARTMENT
    ===================== */
    const groupedData = {};

    attendances.forEach(a => {
      const dept = a.user.department?.department_name || "Tanpa Department";
      const sub = a.user.sub_department?.sub_department_name || "Tanpa Sub";
      const sheetName = `${dept} - ${sub}`.substring(0, 31);

      if (!groupedData[sheetName]) groupedData[sheetName] = [];
      groupedData[sheetName].push(a);
    });

    /* =====================
       CREATE EXCEL
    ===================== */
    const workbook = new ExcelJS.Workbook();

    Object.entries(groupedData).forEach(([sheetName, data]) => {
      const sheet = workbook.addWorksheet(sheetName);

      // Header
      sheet.addRow([
        "Nama Pegawai",
        "Department",
        "Sub Department",
        "Shift",
        "Tanggal",
        "Jam Mulai",
        "Jam Akhir",
        "Total Jam"
      ]);
      sheet.getRow(1).font = { bold: true };

      // Data
      data.forEach(a => {
        sheet.addRow([
          a.user.display_name,
          a.user.department?.department_name ?? "-",
          a.user.sub_department?.sub_department_name ?? "-",
          a.shift?.shift_name ?? "-",
          a.attendance_date.toISOString().slice(0, 10),
          formatTime(a.checkin_time),
          formatTime(a.checkout_time),
          calcTotalHours(a.checkin_time, a.checkout_time)
        ]);
      });

      sheet.columns.forEach(col => {
        if (!col.width) col.width = 18;
      });
    });

    /* =====================
       RESPONSE
    ===================== */
    const filename = `laporan-absensi-${start_date}-sampai-${end_date}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("DOWNLOAD ATTENDANCE RANGE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengunduh laporan absensi berdasarkan tanggal"
    });
  }
};

// Generate By ID + Range Date
export const downloadAttendanceReportByIdAndDateRange = async (req, res) => {
  try {
    const { period_id, user_id, start_date, end_date } = req.query;

    if (!period_id || !user_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "period_id, user_id, start_date, dan end_date wajib diisi"
      });
    }

    const {
      id: currentUserId,
      user_role_id,
      department_id,
      sub_department_id
    } = req.user;

    const period = await prisma.schedule_periods.findUnique({
      where: { period_id: Number(period_id) }
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        message: "Periode tidak ditemukan"
      });
    }

    if (
      user_role_id === ROLES.STAFF &&
      Number(user_id) !== currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke laporan user lain"
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999);

    let where = {
      period_id: Number(period_id),
      user_id: Number(user_id),
      attendance_date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (user_role_id === ROLES.KEPALA_INSTALASI) {
      where.user = { department_id };
    }

    if (user_role_id === ROLES.KEPALA_SUB_INSTALASI) {
      where.user = { sub_department_id };
    }

    const attendances = await prisma.attendances.findMany({
      where,
      orderBy: { attendance_date: "asc" },
      include: {
        shift: { select: { shift_name: true } },
        user: {
          select: {
            display_name: true,
            department: { select: { department_name: true } },
            sub_department: { select: { sub_department_name: true } }
          }
        }
      }
    });

    if (!attendances.length) {
      return res.status(404).json({
        success: false,
        message: "Data absensi tidak ditemukan pada rentang tanggal tersebut"
      });
    }

    const workbook = new ExcelJS.Workbook();

    const rawUserName =
      attendances[0].user.display_name.substring(0, 31);
    const safeUserName = sanitizeFilename(rawUserName);

    const sheet = workbook.addWorksheet(safeUserName || "Absensi");

    // Header
    sheet.addRow([
      "Nama Pegawai",
      "Department",
      "Sub Department",
      "Shift",
      "Tanggal",
      "Jam Mulai",
      "Jam Akhir",
      "Total Jam"
    ]);
    sheet.getRow(1).font = { bold: true };

    // Data
    attendances.forEach(a => {
      sheet.addRow([
        a.user.display_name,
        a.user.department?.department_name ?? "-",
        a.user.sub_department?.sub_department_name ?? "-",
        a.shift?.shift_name ?? "-",
        a.attendance_date.toISOString().slice(0, 10),
        formatTime(a.checkin_time),
        formatTime(a.checkout_time),
        calcTotalHours(a.checkin_time, a.checkout_time)
      ]);
    });

    sheet.columns.forEach(col => {
      if (!col.width) col.width = 20;
    });

    const filename =
      `laporan-absensi-${safeUserName}-${start_date}-sampai-${end_date}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("DOWNLOAD ATTENDANCE BY ID RANGE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengunduh laporan absensi berdasarkan user dan tanggal"
    });
  }
};