import { prisma } from "../../config/prisma.js";
import bcrypt from "bcrypt";
import { saveAvatar } from "../utils/photoUtils.js";
import fs from "fs";

// Helper konversi ke Int atau null
const toInt = (val) => {
  if (val === undefined || val === null || val === "") return null;
  return Number(val);
};

export const registerUser = async (req, res) => {
  try {
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const {
      email,
      // username,
      password,
      national_id_number,
      employee_id_number,
      phone_number,
      department_id,
      sub_department_id,

      user_role_id,
      location_id,
      title_prefix,
      full_name,
      title_suffix,
      gender,
      birth_date,
      address,
      employee_status_id,
      hire_date,
      termination_date
    } = req.body;

    // Validasi wajib
    if (!email || !password || !national_id_number || !employee_id_number || !phone_number || !department_id || !user_role_id || !location_id) {
      return res.status(400).json({
        success: false,
        message: "email, employee id number, password, NIK, No. HP, Department, Role, Lokasi wajib diisi"        
      });
    }

    // Check existing email
    const existingEmail = await prisma.users.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
    }

    // Check existing NIK
    const existingNIK = await prisma.users.findUnique({ where: { national_id_number } });
    if (existingNIK) {
      return res.status(400).json({ success: false, message: "NIK sudah terdaftar" });
    }

    // Check existing Employee ID
    const existingEmpID = await prisma.users.findUnique({ where: { employee_id_number } });
    if (existingEmpID) {
      return res.status(400).json({ success: false, message: "NIP/NRK sudah terdaftar" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Transaction create user + user_details
    const result = await prisma.$transaction(async (tx) => {
      // 1. create user
      const user = await tx.users.create({
        data: {
          email,
          // username,
          password_hash,
          national_id_number,
          employee_id_number,
          phone_number,
          department_id: toInt(department_id),
          sub_department_id: toInt(sub_department_id),
          user_role_id: toInt(user_role_id),
          location_id: toInt(location_id),
          is_active: true,
          created_at: new Date(),
          avatar: avatarUrl
        }
      });

      // 2. create user_details + display_name
      const computedDisplayName = `${title_prefix ? title_prefix + " " : ""}${full_name}${title_suffix ? " " + title_suffix : ""}`;

      const details = await tx.user_details.create({
        data: {
          user_id: user.user_id,
          title_prefix,
          full_name,
          title_suffix,
          gender,
          birth_date: birth_date ? new Date(birth_date) : null,
          address,
          employee_status_id: toInt(employee_status_id),
          hire_date: hire_date ? new Date(hire_date) : null,
          termination_date: termination_date ? new Date(termination_date) : null,
          created_at: new Date()
        }
      });

      // 3. update display_name di users
      const updatedUser = await tx.users.update({
        where: { user_id: user.user_id },
        data: {
          display_name: computedDisplayName
        }
      });

      // Pastikan avatar terbaru juga ada di objek updatedUser
      updatedUser.avatar = user.avatar;

      return { user: updatedUser, details };
    });

    res.status(201).json({
      success: true,
      message: "User berhasil diregistrasi",
      data: result
    });

  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') {
      const target = err.meta?.target;
      if (target?.includes('national_id_number')) {
        return res.status(400).json({ success: false, message: "NIK sudah terdaftar" });
      }
      if (target?.includes('employee_id_number')) {
        return res.status(400).json({ success: false, message: "NIP/NRK sudah terdaftar" });
      }
      if (target?.includes('email')) {
        return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
      }
    }
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * GET USERS (with user_details)
 */
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      where: { deleted_at: null },
      select: {
        user_id: true,
        national_id_number: true,
        employee_id_number: true,
        email: true,
        // username: true,
        phone_number: true,
        display_name: true,
        department_id: true,
        sub_department_id: true,
        user_role_id: true,
        location_id: true,
        is_active: true,
        avatar: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        department: { select: { department_name: true } },
        sub_department: { select: { sub_department_name: true } },
        user_role: { select: { user_role_name: true } },
        location: { select: { location_name: true } },
        user_details: { select: { title_prefix: true, full_name: true, title_suffix: true, gender: true, birth_date: true, address: true, employee_status_id: true, hire_date: true, termination_date: true } }
      }
    });

    // flatten relasi dan hapus nested objek
    const data = users.map(u => ({
      ...u,
      department_name: u.department?.department_name || null,
      sub_department_name: u.sub_department?.sub_department_name || null,
      user_role_name: u.user_role?.user_role_name || null,
      location_name: u.location?.location_name || null,
      user_details: u.user_details || null,
      department: undefined,
      sub_department: undefined,
      user_role: undefined,
      location: undefined
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


/**
 * GET USER BY ID
 */
export const getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.users.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        national_id_number: true,
        employee_id_number: true,
        email: true,
        // username: true,
        phone_number: true,
        display_name: true,
        department_id: true,
        sub_department_id: true,
        user_role_id: true,
        location_id: true,
        is_active: true,
        avatar: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        department: {
          select: {
            department_id: true,
            department_name: true
          }
        },
        sub_department: {
          select: {
            sub_department_id: true,
            sub_department_name: true
          }
        },
        user_role: {
          select: {
            user_role_id: true,
            user_role_name: true
          }
        },
        location: {
          select: {
            location_name: true
          }
        },
        user_details: {
          select: {
            user_detail_id: true,
            full_name: true,
            title_prefix: true,
            title_suffix: true,
            gender: true,
            birth_date: true,
            address: true,
            employee_status_id: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    // flatten relasi supaya lebih ringkas
    const response = {
      ...user,
      location_name: user.location?.location_name || null,
      department_name: user.department?.department_name || null,
      sub_department_name: user.sub_department?.sub_department_name || null,
      user_role_name: user.user_role?.user_role_name || null,
      user_details: user.user_details || null
    };

    // hapus nested objek dan password
    delete response.location;
    delete response.department;
    delete response.sub_department;
    delete response.user_role;

    res.json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const {
      email,
      national_id_number,
      employee_id_number,
      phone_number,
      display_name,
      is_active,
      title_prefix,
      full_name,
      title_suffix,
      gender,
      birth_date,
      address,
      employee_status_id,
      department_id,
      sub_department_id,
      user_role_id,
      location_id,
      password
    } = req.body;

    // cek user ada atau tidak
    const existUser = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { user_details: true }
    });

    if (!existUser) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    // Buat display_name berdasarkan prefix, fullname, dan suffix
    const computedDisplayName = `${title_prefix ? title_prefix + " " : ""}${full_name}${title_suffix ? " " + title_suffix : ""}`;

    // Validasi email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Format email tidak valid" });
    }

    // Validasi nomor telepon
    const phoneRegex = /^[0-9]{10,15}$/; // Contoh format angka 10-15 digit
    if (phone_number && !phoneRegex.test(phone_number)) {
      return res.status(400).json({ success: false, message: "Nomor telepon tidak valid" });
    }

    // Validasi tanggal lahir
    if (birth_date && isNaN(Date.parse(birth_date))) {
      return res.status(400).json({ success: false, message: "Tanggal lahir tidak valid" });
    }

    let avatarPath = undefined;
    if (req.file) {
      let buffer = req.file.buffer;
      // FIX: Jika menggunakan diskStorage, buffer tidak tersedia, baca dari path
      if (!buffer && req.file.path) {
        buffer = fs.readFileSync(req.file.path);
      }

      if (buffer) {
        avatarPath = await saveAvatar(buffer, userId);
        
        // Hapus file temp multer jika kita membacanya dari disk
        if (!req.file.buffer && req.file.path) {
          try { fs.unlinkSync(req.file.path); } catch(e) {}
        }
      }
    }

    let password_hash = undefined;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    const result = await prisma.$transaction(async (tx) => {
      // UPDATE users
      const updatedUser = await tx.users.update({
        where: { user_id: userId },
        data: {
          email: email ?? existUser.email,
          national_id_number: national_id_number ?? existUser.national_id_number,
          employee_id_number: employee_id_number ?? existUser.employee_id_number,
          phone_number: phone_number ?? existUser.phone_number,
          display_name: display_name ?? computedDisplayName,
          avatar: avatarPath,
          password_hash: password_hash ?? existUser.password_hash,
          department_id: department_id ? Number(department_id) : existUser.department_id,
          sub_department_id: sub_department_id ? Number(sub_department_id) : existUser.sub_department_id,        
          user_role_id: user_role_id ? Number(user_role_id) : existUser.user_role_id,
          location_id: location_id ? Number(location_id) : existUser.location_id,
          is_active: is_active === 'true' || is_active === true ? true : (is_active === 'false' || is_active === false ? false : existUser.is_active),
          updated_at: new Date()
        }
      });

      // UPDATE / CREATE user_details
      let updatedDetails;

      if (existUser.user_details) {
        updatedDetails = await tx.user_details.update({
          where: { user_id: userId },
          data: {
            title_prefix,
            full_name,
            title_suffix,
            gender,
            birth_date: birth_date ? new Date(birth_date) : null,
            address,
            employee_status_id: employee_status_id ? Number(employee_status_id) : undefined,
            updated_at: new Date()
          }
        });
      } else {
        updatedDetails = await tx.user_details.create({
          data: {
            user_id: userId,
            title_prefix,
            full_name,
            title_suffix,
            gender,
            birth_date: birth_date ? new Date(birth_date) : null,
            address,
            employee_status_id: employee_status_id ? Number(employee_status_id) : null,
            created_at: new Date()
          }
        });
      }

      return { updatedUser, updatedDetails };
    });

    res.json({
      success: true,
      message: "User berhasil diupdate",
      data: result
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') {
      const target = err.meta?.target;
      if (target?.includes('national_id_number')) {
        return res.status(400).json({ success: false, message: "NIK sudah terdaftar" });
      }
      if (target?.includes('employee_id_number')) {
        return res.status(400).json({ success: false, message: "NIP/NRK sudah terdaftar" });
      }
      if (target?.includes('email')) {
        return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
      }
    }
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const softDeleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // cek apakah user ada dan belum dihapus
    const exist = await prisma.users.findUnique({
      where: { user_id: id }
    });

    if (!exist || exist.deleted_at) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan atau sudah dihapus"
      });
    }

    // update deleted_at dan is_active
    await prisma.users.update({
      where: { user_id: id },
      data: {
        deleted_at: new Date(),
        is_active: false
      }
    });

    res.json({
      success: true,
      message: "User berhasil dihapus (soft delete)"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};