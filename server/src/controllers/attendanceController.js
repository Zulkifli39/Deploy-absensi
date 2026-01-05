import { prisma } from "../../config/prisma.js";
import { haversineDistance } from "../utils/geo.js";
import sharp from "sharp";  // Untuk manipulasi gambar
import path from "path";    // Untuk mengatur path file
import { getLateLevel, getEarlyLeaveLevel } from "../services/attendanceService.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { addTextAndCompressImage } from "../utils/photoUtils.js";
import { calculateLatePenalty } from "../services/attendancePenalty.js";
import { calculateEarlyLeavePenalty } from "../services/attendancePenalty.js";
import { getFaceDescriptor, verifyFace } from "../utils/faceRecognition.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Makassar";

const getLocalTimeForDB = (date = new Date()) => {
  const localString = dayjs(date).tz(TZ).format("YYYY-MM-DD HH:mm:ss.SSS");
  return dayjs.utc(localString).toDate();
};

const formatDate = (date) => {
  if (!date) return null;
  // Karena DB menyimpan "21:00" sebagai value, kita format sebagai UTC agar angkanya tidak berubah       
  return dayjs.utc(date).format("YYYY-MM-DD HH:mm:ss");
};

export const checkAttendanceLocation = async (req, res) => {
  try {
    const { user_id, latitude, longitude } = req.body;

    if (
      user_id === undefined ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "user_id, latitude, dan longitude wajib diisi"
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Koordinat tidak valid"
      });
    }

    const user = await prisma.users.findUnique({
      where: { user_id: Number(user_id) },
      include: { location: true }
    });

    if (!user || !user.location) {
      return res.status(404).json({
        success: false,
        message: "Lokasi user tidak ditemukan"
      });
    }

    const officeLat = Number(user.location.latitude);
    const officeLng = Number(user.location.longitude);
    const radius = user.location.radius_meter;

    if (!officeLat || !officeLng || !radius) {
      return res.status(400).json({
        success: false,
        message: "Data lokasi belum lengkap"
      });
    }

    const distance = haversineDistance(
      lat,
      lng,
      officeLat,
      officeLng
    );

    if (isNaN(distance)) {
      return res.status(500).json({
        success: false,
        message: "Gagal menghitung jarak lokasi"
      });
    }

    const isAllowed = distance <= radius;

    return res.json({
      success: true,
      allowed: isAllowed,
      distance_in_meter: Math.round(distance),
      radius_meter: radius,
      message: isAllowed
        ? "Lokasi valid, silakan absen"
        : "Lokasi tidak valid, anda berada di luar radius lokasi"
    });

  } catch (error) {
    console.error("checkAttendanceLocation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



export const checkIn = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const location_id = Number(req.body.location_id);
    const face_verified = req.body.face_verified === "true";

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Koordinat tidak valid"
      });
    }

    if (!face_verified) {
      return res.status(400).json({
        success: false,
        message: "Verifikasi wajah wajib"
      });
    }

      //  FOTO (MULTER)
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Foto wajib diambil"
      });
    }

    const photoBuffer = req.file.buffer;

    // Verif Wajah
    const registeredFaces = await prisma.user_faces.findMany({
      where: { user_id, deleted_at: null }
    });

    if (registeredFaces.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Wajah Anda belum didaftarkan. Silakan hubungi admin atau daftar wajah di profil."       
      });
    }

    const currentDescriptor = await getFaceDescriptor(photoBuffer);
    if (!currentDescriptor) {
      return res.status(400).json({
        success: false,
        message: "Wajah tidak terdeteksi pada foto absensi. Pastikan pencahayaan cukup."
      });
    }

    let isFaceMatched = false;
    for (const face of registeredFaces) {
      if (face.descriptor) {
        const storedDescriptor = new Float32Array(JSON.parse(face.descriptor));
        if (verifyFace(currentDescriptor, storedDescriptor)) {
          isFaceMatched = true;
          break;
        }
      }
    }

    if (!isFaceMatched) {
      return res.status(400).json({
        success: false,
        message: "Wajah tidak cocok dengan data terdaftar"
      });
    }

    const nowReal = new Date();
    const nowDB = getLocalTimeForDB(nowReal);

    const startOfDayRaw = dayjs(nowReal).tz(TZ).startOf("day"); // 00:00 WITA
    const endOfDayRaw = dayjs(nowReal).tz(TZ).endOf("day");     // 23:59 WITA

    const startOfDayDB = dayjs.utc(startOfDayRaw.format("YYYY-MM-DD HH:mm:ss.SSS")).toDate();
    const endOfDayDB = dayjs.utc(endOfDayRaw.format("YYYY-MM-DD HH:mm:ss.SSS")).toDate();

    /* =========================
       CEK SUDAH ABSEN?
    ========================= */
    const exist = await prisma.attendances.findFirst({
      where: {
        user_id,
        attendance_date: {
          gte: startOfDayDB,
          lte: endOfDayDB
        }
      }
    });

    if (exist) {
      return res.status(409).json({
        success: false,
        message: "Sudah check-in hari ini bos"
      });
    }

    /* =========================
       SHIFT USER & PERIOD
    ========================= */
    let schedule = await prisma.user_shift_schedules.findFirst({
      where: {
        user_id,
        schedule_date: {
          gte: startOfDayDB,
          lte: endOfDayDB
        }
      },
      include: { shift: true }
    });

    let shift;
    let period_id = null;

    if (schedule) {
      shift = schedule.shift;
      period_id = schedule.period_id;
    } else {
      shift = await prisma.shifts.findFirst({
        where: {
          shift_type: "REGULER",
          department_id: req.user.department_id
        }
      });

      if (!shift) {
        return res.status(404).json({
          success: false,
          message: "Tidak ada shift hari ini"
        });
      }

      // Cari periode aktif jika tidak ada jadwal spesifik
      const activePeriod = await prisma.schedule_periods.findFirst({
        where: {
          start_date: { lte: startOfDayDB },
          end_date: { gte: startOfDayDB }
        }
      });

      if (activePeriod) {
        period_id = activePeriod.period_id;
      }
    }

    if (!period_id) {
       return res.status(400).json({
         success: false,
         message: "Periode jadwal tidak ditemukan. Hubungi admin."
       });
    }

    /* =========================
       CEK LOKASI
    ========================= */
    const location = await prisma.locations.findUnique({
      where: { location_id }
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Lokasi tidak ditemukan"
      });
    }

    const distance = haversineDistance(
      latitude,
      longitude,
      Number(location.latitude),
      Number(location.longitude)
    );

    console.log(`[CheckIn Debug] User: ${latitude}, ${longitude} | Office: ${location.latitude}, ${location.longitude} | Dist: ${distance}m | Radius: ${location.radius_meter}m`);

    if (distance > location.radius_meter) {
      return res.status(403).json({
        success: false,
        message: "Di luar radius absensi",
        distance: Math.round(distance),
        max_radius: location.radius_meter,
        debug: {
          user_lat: latitude,
          user_lng: longitude,
          office_lat: Number(location.latitude),
          office_lng: Number(location.longitude)
        }
      });
    }

    /* =========================
       HITUNG TERLAMBAT
    ========================= */
    // Gabungkan Tanggal DB (WITA) dengan Jam Shift (String)
    // Contoh: "2025-12-24" (WITA) + "08:00:00" -> 2025-12-24 08:00:00 DB Time
    const shiftStartString = `${dayjs(startOfDayDB).format("YYYY-MM-DD")} ${shift.checkin_time}`; // YYYY-MM-DD HH:mm:ss
    const shiftStartDB = dayjs.utc(shiftStartString).toDate();

    const lateMinutes =
        nowDB > shiftStartDB
          ? Math.floor((nowDB.getTime() - shiftStartDB.getTime()) / 60000)
          : 0;

    const penalty = calculateLatePenalty(lateMinutes);

    /* =========================
       FOTO (Gunakan nowReal agar timestamp di foto sesuai zona waktu sistem/OS jika diinginkan,
       atau gunakan dayjs(nowReal).tz(TZ) agar foto tertulis jam WITA)
    ========================= */
    const checkin_photo_url = await addTextAndCompressImage(
      photoBuffer,
      req.user.display_name,
      latitude,
      longitude,
      dayjs(nowReal).tz(TZ).toDate(), // Pass WITA Date object
      "checkin"
    );

    /* =========================
       SIMPAN ABSENSI
    ========================= */
    const attendance = await prisma.attendances.create({
      data: {
        user_id,
        shift_id: shift.shift_id,
        period_id,
        location_id,

        // SIMPAN DATA LOKAL WITA
        attendance_date: startOfDayDB,
        checkin_time: nowDB,

        checkin_latitude: latitude,
        checkin_longitude: longitude,
        checkin_distance: distance,
        checkin_photo_url,

        attendance_method: "FACE",
        late_minutes: penalty.late_minutes,
        late_level: penalty.late_level,
        is_late: penalty.is_late,

        attendance_status: "HADIR"
      }
    });

    // Format output string agar FE menerima format YYYY-MM-DD HH:mm:ss
    const formattedAttendance = {
      ...attendance,
      attendance_date: formatDate(attendance.attendance_date),
      checkin_time: formatDate(attendance.checkin_time),
      checkout_time: formatDate(attendance.checkout_time),
      created_at: formatDate(attendance.created_at),
      updated_at: formatDate(attendance.updated_at),
      user_shift_schedule: schedule ? {
        ...schedule,
        user_id: undefined,
        shift_id: undefined,
        period_id: undefined,
        shift: schedule.shift ? {
          ...schedule.shift,
          shift_id: undefined
        } : null
      } : null
    };

    res.json({
      success: true,
      message: "Check-in berhasil",
      data: formattedAttendance
    });

  } catch (err) {
    console.error("CHECK-IN ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* =========================
   CHECK-OUT
========================= */
export const checkOut = async (req, res) => {
  try {
    /* =========================
       AUTH
    ========================= */
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    /* =========================
       BODY
    ========================= */
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);
    const face_verified = req.body.face_verified === "true";

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Koordinat tidak valid"
      });
    }

    if (!face_verified) {
      return res.status(400).json({
        success: false,
        message: "Verifikasi wajah wajib"
      });
    }

    /* =========================
       FOTO
    ========================= */
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Foto checkout wajib diambil"
      });
    }

    const photoBuffer = req.file.buffer;

    /* =========================
       VERIFIKASI WAJAH
    ========================= */
    const registeredFaces = await prisma.user_faces.findMany({
      where: { user_id, deleted_at: null }
    });

    if (registeredFaces.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Wajah Anda belum didaftarkan. Silakan hubungi admin atau daftar wajah di profil."       
      });
    }

    const currentDescriptor = await getFaceDescriptor(photoBuffer);
    if (!currentDescriptor) {
      return res.status(400).json({
        success: false,
        message: "Wajah tidak terdeteksi pada foto absensi. Pastikan pencahayaan cukup."
      });
    }

    let isFaceMatched = false;
    for (const face of registeredFaces) {
      if (face.descriptor) {
        const storedDescriptor = new Float32Array(JSON.parse(face.descriptor));
        if (verifyFace(currentDescriptor, storedDescriptor)) {
          isFaceMatched = true;
          break;
        }
      }
    }

    if (!isFaceMatched) {
      return res.status(400).json({
        success: false,
        message: "Wajah tidak cocok dengan data terdaftar"
      });
    }

    /* =========================
       WAKTU LOKAL (WITA)
    ========================= */
    const nowReal = new Date();
    const nowDB = getLocalTimeForDB(nowReal);

    const startOfDayRaw = dayjs(nowReal).tz(TZ).startOf("day");
    const endOfDayRaw = dayjs(nowReal).tz(TZ).endOf("day");

    const startOfDayDB = dayjs.utc(startOfDayRaw.format("YYYY-MM-DD HH:mm:ss.SSS")).toDate();
    const endOfDayDB = dayjs.utc(endOfDayRaw.format("YYYY-MM-DD HH:mm:ss.SSS")).toDate();

    /* =========================
       CARI CHECK-IN AKTIF
    ========================= */
    const attendance = await prisma.attendances.findFirst({
      where: {
        user_id,
        attendance_date: {
          gte: startOfDayDB,
          lte: endOfDayDB
        },
        checkout_time: null
      }
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "Belum check-in atau sudah checkout"
      });
    }

    /* =========================
       GET SCHEDULE & PERIOD (If missing)
    ========================= */
    let schedule = await prisma.user_shift_schedules.findFirst({
      where: {
        user_id,
        schedule_date: {
          gte: startOfDayDB,
          lte: endOfDayDB
        }
      },
      include: { shift: true }
    });

    let period_id = attendance.period_id;

    if (!period_id) {
       if (schedule) {
         period_id = schedule.period_id;
       } else {
         const activePeriod = await prisma.schedule_periods.findFirst({
            where: {
              start_date: { lte: startOfDayDB },
              end_date: { gte: startOfDayDB }
            }
         });
         if (activePeriod) period_id = activePeriod.period_id;
       }
    }

    if (!period_id) {
        return res.status(400).json({
            success: false,
            message: "Periode jadwal tidak valid/ditemukan."
        });
    }

    /* =========================
       SHIFT
    ========================= */
    const shift = await prisma.shifts.findUnique({
      where: { shift_id: attendance.shift_id }
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift tidak ditemukan"
      });
    }

    /* =========================
       CEK LOKASI
    ========================= */
    const location = await prisma.locations.findUnique({
      where: { location_id: attendance.location_id }
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Lokasi absensi tidak ditemukan"
      });
    }

    const distance = haversineDistance(
      latitude,
      longitude,
      Number(location.latitude),
      Number(location.longitude)
    );

    if (distance > location.radius_meter) {
      return res.status(403).json({
        success: false,
        message: "Di luar radius absensi",
        distance: Math.round(distance),
        max_radius: location.radius_meter
      });
    }

    /* =========================
       HITUNG PULANG CEPAT
    ========================= */
    // Gabungkan Attendance Date DB dengan Shift Checkout Time
    const shiftEndString = `${dayjs(attendance.attendance_date).format("YYYY-MM-DD")} ${shift.checkout_time}`;
    const shiftEndDB = dayjs.utc(shiftEndString).toDate();

    const earlyLeaveMinutes =
      nowDB < shiftEndDB
        ? Math.floor((shiftEndDB.getTime() - nowDB.getTime()) / 60000)
        : 0;

    const earlyPenalty = calculateEarlyLeavePenalty(earlyLeaveMinutes);

    /* =========================
       FOTO
    ========================= */
    const checkout_photo_url = await addTextAndCompressImage(
      photoBuffer,
      req.user.display_name,
      latitude,
      longitude,
      dayjs(nowReal).tz(TZ).toDate(), // WITA
      "checkout"
    );

    /* =========================
       HITUNG JAM KERJA
    ========================= */
    // Karena attendance.checkin_time sudah DB Time (WITA) dan nowDB juga WITA, pengurangan aman.
    const working_minutes = Math.floor(
      (nowDB.getTime() - new Date(attendance.checkin_time).getTime()) / 60000
    );

    /* =========================
       UPDATE ABSENSI
    ========================= */
    const updatedAttendance = await prisma.attendances.update({
      where: {
        attendance_id: attendance.attendance_id
      },
      data: {
        period_id, // Ensure period_id is updated if it was missing
        checkout_time: nowDB, // Simpan WITA
        checkout_latitude: latitude,
        checkout_longitude: longitude,
        checkout_distance: distance,
        checkout_photo_url,

        attendance_method: "FACE",

        // working_minutes, // Enable jika kolom sudah ada di DB

        early_leave_minutes: earlyPenalty.early_leave_minutes,
        early_leave_level: earlyPenalty.early_leave_level,
        is_early_leave: earlyPenalty.is_early_leave
      }
    });

    const formattedAttendance = {
      ...updatedAttendance,
      attendance_date: formatDate(updatedAttendance.attendance_date),
      checkin_time: formatDate(updatedAttendance.checkin_time),
      checkout_time: formatDate(updatedAttendance.checkout_time),
      created_at: formatDate(updatedAttendance.created_at),
      updated_at: formatDate(updatedAttendance.updated_at),
      user_shift_schedule: schedule ? {
        ...schedule,
        user_id: undefined,
        shift_id: undefined,
        period_id: undefined,
        shift: schedule.shift ? {
          ...schedule.shift,
          shift_id: undefined
        } : null
      } : null
    };

    return res.json({
      success: true,
      message: "Check-out berhasil",
      data: formattedAttendance
    });

  } catch (err) {
    console.error("CHECK-OUT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =========================
   GET ATTENDANCE HISTORY (USER ONLY)
========================= */
export const getAttendanceHistory = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const limit = parseInt(req.query.limit) || 100;
    const { start_date, end_date } = req.query;

    const where = {
      user_id: user_id
    };

    if (start_date || end_date) {
        where.attendance_date = {};
        if (start_date) {
             where.attendance_date.gte = dayjs
              .tz(start_date, TZ)
              .startOf("day")
              .utc()
              .toDate();
        }
        if (end_date) {
            where.attendance_date.lte = dayjs
              .tz(end_date, TZ)
              .endOf("day")
              .utc()
              .toDate();
        }
    }

    const history = await prisma.attendances.findMany({
      where: where,
      orderBy: {
        attendance_date: 'desc'
      },
      take: limit
    });

    const formattedHistory = history.map(att => ({
      ...att,
      attendance_date: formatDate(att.attendance_date),
      checkin_time: formatDate(att.checkin_time),
      checkout_time: formatDate(att.checkout_time),
      created_at: formatDate(att.created_at),
      updated_at: formatDate(att.updated_at)
    }));

    return res.json({
      success: true,
      data: formattedHistory
    });

  } catch (error) {
    console.error("GET HISTORY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
   GET ALL ATTENDANCE HISTORY
========================= */

export const getAllAttendanceHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const { start_date, end_date } = req.query;

    const where = {};
    
    if (start_date || end_date) {
        where.attendance_date = {};
        if (start_date) {
             where.attendance_date.gte = dayjs
              .tz(start_date, TZ)
              .startOf("day")
              .utc()
              .toDate();
        }
        if (end_date) {
            where.attendance_date.lte = dayjs
              .tz(end_date, TZ)
              .endOf("day")
              .utc()
              .toDate();
        }
    }

    const history = await prisma.attendances.findMany({
      where,
      orderBy: {
        attendance_date: 'desc'
      },
      take: limit
    });

    const formattedHistory = history.map(att => ({
      ...att,
      attendance_date: formatDate(att.attendance_date),
      checkin_time: formatDate(att.checkin_time),
      checkout_time: formatDate(att.checkout_time),
      created_at: formatDate(att.created_at),
      updated_at: formatDate(att.updated_at)
    }));

    return res.json({
      success: true,
      data: formattedHistory
    });

  } catch (error) {
    console.error("GET ALL HISTORY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
//       total: formatted.length,
//       data: formatted
//     });

//   } catch (error) {
//     console.error("GET ATTENDANCES ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };e,
//       total: formatted.length,
//       data: formatted
//     });

//   } catch (error) {
//     console.error("GET ATTENDANCES ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };