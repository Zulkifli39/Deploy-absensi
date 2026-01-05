import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";

export const protect = async (req, res, next) => {
  let token;

  // Pastikan token ada di header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Ambil token dari header

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // console.log("Decoded token:", decoded); // Debug: Cek hasil decoding token

      // Ambil user berdasarkan decoded.id yang ada pada token
      const user = await prisma.users.findUnique({
        where: { user_id: decoded.id }, // Cari user berdasarkan user_id yang ada pada token
        include: {
          user_role: true,      // Termasuk informasi role
          department: true,
          location: true,
          sub_department:true
        }
      });

      // Jika user tidak ditemukan, kembalikan error
      if (!user) {
        console.log("User tidak ditemukan dengan ID:", decoded.id); // Debug: Cek apakah user ada
        return res.status(401).json({ message: "User tidak ditemukan" });
      }

      // Menambahkan informasi user ke request object
      req.user = {
        display_name:user.display_name,
        user_id: user.user_id,
        user_role_id: user.user_role.user_role_id,
        user_role_name: user.user_role?.user_role_name || null,
        department_id:user.department_id,
        department_name:user.department.department_name,
        sub_department_name:user.sub_department.sub_department_name,
        sub_department_id:user.sub_department.sub_department_id
      };

      // console.log("User ID di middleware:", req.user.user_id); 
      // console.log("Display Name di middleware:", req.user.display_name);

      next(); // Lanjutkan ke request berikutnya

    } catch (err) {
      console.error("Error decoding token:", err);  // Log error jika ada kesalahan decoding token
      return res.status(401).json({ message: "Token tidak valid" });
    }
  } else {
    // Jika token tidak ada di header
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }
};


// export const adminOnly = (req, res, next) => {
//   if (!req.user) {
//     return res.status(403).json({ message: "Akses ditolak" });
//   }

//   if (req.user.user_role_id === 1) {
//     return next();
//   }

//   return res.status(403).json({ message: "Hanya admin yang bisa mengakses" });
// };


// export const staffOnly = (req, res, next) => {
//   if (!req.user) {
//     return res.status(403).json({ message: "Akses ditolak" });
//   }

//   const allowed = [1,2, 3]; // 2 = Admin, 3 = Staff

//   if (allowed.includes(req.user.user_role_id)) {
//     return next();
//   }

//   return res.status(403).json({ message: "Hanya staff atau admin yang bisa mengakses" });
// };


// export const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       const user = await prisma.users.findUnique({
//         where: { user_id: decoded.id },
//         include: {
//           user_role: true,      // sesuai response login
//           department: true,
//           location: true
//         },
//       });

//       if (!user) {
//         return res.status(401).json({ message: "User tidak ditemukan" });
//       }

//       req.user = {
//         user_id: user.user_id,
//         user_role_id: user.user_role.user_role_id, // ⬅️ WAJIB ADA
//         user_role_name: user.user_role?.user_role_name || null,
//       };

//       next();

//     } catch (err) {
//       return res.status(401).json({ message: "Token tidak valid" });
//     }
//   } else {
//     return res.status(401).json({ message: "Token tidak ditemukan" });
//   }
// };

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.user_id }; // pastikan payload token ada user_id
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};