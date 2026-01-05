
export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    PROFILE: "/api/auth/profile",
    UPDATE: "/api/auth/profile",
    RESET_PASSWORD: "/api/auth/reset-password",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
  },
  USERS : {
    GET_ALL: "/api/users",
    GET_BY_ID: "/api/users/:id",
    UPDATE: "/api/users/:id",
    DELETE: "/api/users/:id",
    CREATE: "/api/users/register",
  },
  DEPARTMENT : {
    CREATE: "/api/departments",
    GET_ALL: "/api/departments",
    GET_BY_ID: "/api/departments/:id", 
    UPDATE: "/api/departments/:id",
    DELETE: "/api/departments/:id",
  },
  INFORMATION : {
    GET_ALL: "/api/information",
    GET_BY_ID: "/api/information/:id",
    UPDATE: "/api/information/:id",
    DELETE: "/api/information/:id",
    CREATE: "/api/information",
  },
  EMPLOYEE_STATUS: {
    GET_ALL: "/api/employee-status",
    GET_BY_ID : "/api/employee-status/:id",
    UPDATE: "/api/employee-status/:id",
    DELETE: "/api/employee-status/:id",
    CREATE: "/api/employee-status",
  },
  SUB_DEPARTMENTS: {
    GET_ALL: "/api/sub-departments",
    GET_BY_ID: "/api/sub-departments/:id",
    GET_BY_DEPARTMENT: "/api/sub-departments/department/:department_id",
    CREATE: "/api/sub-departments",
    UPDATE: "/api/sub-departments/:id",
    DELETE: "/api/sub-departments/:id",
  },
  USER_ROLES : {
    GET_ALL: "/api/user-roles",
    GET_BY_ID: "/api/user-roles/:id",
    CREATE: "/api/user-roles",
    UPDATE: "/api/user-roles/:id",
    DELETE: "/api/user-roles/:id",
  },
  LOCATION : {
    GET_ALL: "/api/locations",
    GET_BY_ID: "/api/locations/:id",
    CREATE: "/api/locations",
    UPDATE: "/api/locations/:id",
    DELETE: "/api/locations/:id",
  },
  SHIFT : {
    GET_ALL : "/api/shifts",
    GET_BY_ID : "/api/shifts/:id",
    CREATE : "/api/shifts",
    UPDATE : "/api/shifts/:id",
    DELETE : "/api/shifts/:id",
  },
  SCHEDULE_PERIODS : {
    GET_ALL : "/api/schedule-periods",
    GET_BY_ID : "/api/schedule-periods/:id",
    CREATE : "/api/schedule-periods",
    UPDATE : "/api/schedule-periods/:id",        
    LOCK   : "/api/schedule-periods/:id/lock",   
    DELETE : "/api/schedule-periods/:id",
  },

  ATTENDANCE : {
    GET_HISTORY : "/api/attendance/history",
    GET_ALL : "/api/attendance/all-history",
    GET_BY_ID : "/api/attendance/:id",
    CREATE : "/api/attendance",
    UPDATE : "/api/attendance/:id",
    DELETE : "/api/attendance/:id",
  },

  USER_SHIFT_SCHEDULES : {
    GET_ALL : "/api/user-shift-schedules/:period_id",
    UPDATE : "/api/user-shift-schedules/:period_id/:schedule_id",
    CREATE : "/api/user-shift-schedules/:period_id",
    DELETE : "/api/user-shift-schedules/:period_id/:schedule_id",
    TEMPLATE_EXCEL: "api/user-shift-schedules/:period_id/template-excel",
    PREVIEW_EXCEL: "api/user-shift-schedules/:period_id/preview-excel",
    UPLOAD_EXCEL: "api/user-shift-schedules/:period_id/upload-excel",
  },

  REPORTS : {
    GET_ALL : "/api/reports/attendance",
    GET_BY_ID : "/api/reports/attendance/by-id",
    GET_BY_RANGE : "/api/reports/attendance/range",
    GET_BY_ID_AND_RANGE : "/api/reports/attendance/by-id/range",
  },

  FACE : {
     GET_FACE : (userId) => `/api/user-faces/user/${userId}`, // ✅ BENAR
    CREATE_FACE : "/api/user-faces",
    CHECK_IN : "/api/attendance/checkin",
    CHECK_OUT : "/api/attendance/checkout"
  }
};