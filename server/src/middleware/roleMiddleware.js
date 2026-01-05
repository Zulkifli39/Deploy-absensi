import { ROLES } from "./roles.js";

const deny = (res, message) =>
  res.status(403).json({
    success: false,
    message
  });

// Super Admin Only
//   export const superAdminOnly = (req, res, next) => {
//   console.log("ROLE MIDDLEWARE:", req.user);

//   if (!req.user) return deny(res, "Akses ditolak");

//   if (req.user.user_role_id === ROLES.SUPER_ADMIN) {
//     return next();
//   }

//   return deny(res, "Hanya super admin yang bisa mengakses");
// };


// Admin Only
  export const adminOnly = (req, res, next) => {
  console.log("ROLE MIDDLEWARE:", req.user);

  if (!req.user) return deny(res, "Akses ditolak");

  if (req.user.user_role_id === ROLES.ADMIN) {
    return next();
  }

  return deny(res, "Hanya Admin yang bisa mengakses");
};

// Staff Ke Atas
export const staffOnly = (req, res, next) => {
  if (!req.user) return deny(res, "Akses ditolak");

  const allowed = [
    ROLES.ADMIN,
    ROLES.KEPALA_INSTALASI,
    ROLES.KEPALA_SUB_INSTALASI,
    ROLES.STAFF
  ];

  if (allowed.includes(req.user.user_role_id)) {
    return next();
  }

  return deny(res, "Hanya Staff ke atas");
};

// Kepala Sub Instalasi Ke Atass
export const kepalaSubInstalasiOnly = (req, res, next) => {
  if (!req.user) return deny(res, "Akses ditolak");

  const allowed = [
    ROLES.ADMIN,
    ROLES.KEPALA_INSTALASI,
    ROLES.KEPALA_SUB_INSTALASI
  ];

  if (allowed.includes(req.user.user_role_id)) {
    return next();
  }

  return deny(res, "Hanya Kepala Sub Instalasi ke atas");
};

// Kepala Instalasi Ke Atas
export const kepalaInstalasiOnly = (req, res, next) => {
  if (!req.user) return deny(res, "Akses ditolak");

  const allowed = [
    ROLES.ADMIN,
    ROLES.KEPALA_INSTALASI
  ];

  if (allowed.includes(req.user.user_role_id)) {
    return next();
  }

  return deny(res, "Hanya Kepala Instalasi atau Admin");
};
