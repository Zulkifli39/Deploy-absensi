// =========================
// TERLAMBAT MASUK (TL)
// =========================
export const calculateLatePenalty = (lateMinutes) => {
  if (lateMinutes <= 0) {
    return {
      is_late: false,
      late_level: null,
      late_minutes: 0,
      late_percentage: 0
    };
  }

  if (lateMinutes < 30) {
    return {
      is_late: true,
      late_level: "TL1",
      late_minutes: lateMinutes,
      late_percentage: 1
    };
  }

  if (lateMinutes < 60) {
    return {
      is_late: true,
      late_level: "TL2",
      late_minutes: lateMinutes,
      late_percentage: 1.25
    };
  }

  return {
    is_late: true,
    late_level: "TL3",
    late_minutes: lateMinutes,
    late_percentage: 2.5
  };
};

// =========================
// PULANG SEBELUM WAKTU (PSW)
// =========================
export const calculateEarlyLeavePenalty = (earlyMinutes) => {
  if (earlyMinutes <= 0) {
    return {
      is_early_leave: false,
      early_leave_level: null,
      early_leave_minutes: 0,
      early_leave_percentage: 0
    };
  }

  if (earlyMinutes < 30) {
    return {
      is_early_leave: true,
      early_leave_level: "PSW1",
      early_leave_minutes: earlyMinutes,
      early_leave_percentage: 0.5
    };
  }

  if (earlyMinutes < 60) {
    return {
      is_early_leave: true,
      early_leave_level: "PSW2",
      early_leave_minutes: earlyMinutes,
      early_leave_percentage: 1
    };
  }

  if (earlyMinutes < 90) {
    return {
      is_early_leave: true,
      early_leave_level: "PSW3",
      early_leave_minutes: earlyMinutes,
      early_leave_percentage: 1.25
    };
  }

  return {
    is_early_leave: true,
    early_leave_level: "PSW4",
    early_leave_minutes: earlyMinutes,
    early_leave_percentage: 2.5
  };
};
