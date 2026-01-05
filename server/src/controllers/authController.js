import bcrypt from "bcrypt"; 
import crypto from "crypto";
import nodemailer from "nodemailer";
import { generateToken } from "../utils/generateToken.js";
import { prisma } from "../../config/prisma.js"; 
import { ROLES } from "../middleware/roles.js";

export const register = async (req, res) => {
  try {
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const {
      national_id_number,
      employee_id_number,
      email,
      password, // ganti dari password_hash jadi password agar input lebih jelas
      phone_number,
      display_name,
      department_id,
      sub_department_id,
      user_role_id,
      location_id,
      is_active,
      title_prefix,
      full_name,
      title_suffix,
      gender,
      birth_date,
      address,
      employee_status_id,
      hire_date
    } = req.body;

    // Cek email/username
    const exist = await prisma.users.findFirst({
      where: { OR: [{ email }] },
    });
    if (exist) return res.status(400).json({ message: "Email atau Username sudah terdaftar" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          national_id_number,
          employee_id_number,
          email,
          password_hash: hashedPassword,
          phone_number: phone_number || null,
          display_name,
          department_id: department_id ? Number(department_id) : null,
           sub_department_id: sub_department_id ? Number(sub_department_id) : null,
          user_role_id: user_role_id ? Number(user_role_id) : null,
          location_id: location_id ? Number(location_id) : null,
          is_active: is_active === "false" ? false : true,
          avatar: avatarUrl
        }
      });

      const details = await tx.user_details.create({
        data: {
          user_id: user.user_id,
          title_prefix,
          full_name,
          title_suffix,
          gender,
          birth_date: birth_date ? new Date(birth_date) : null,
          address,
          employee_status_id: Number(employee_status_id),
          hire_date: hire_date ? new Date(hire_date) : null
        }
      });

      return { user, details };
    });

    return res.status(201).json({ message: "Register berhasil", user: result });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
      include: { department: true, sub_department: true, user_role: true, location: true }
    });

    if (!user) return res.status(400).json({ message: "Email tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: "Password salah" });

    const token = generateToken({ id: user.user_id });

    let redirect_to = "/home";
    if (
      user.user_role_id === ROLES.ADMIN ||
      user.user_role_id === ROLES.KEPALA_INSTALASI ||
      user.user_role_id === ROLES.KEPALA_SUB_INSTALASI
    ) {
      redirect_to = "/dashboard";
    }

    return res.json({
      message: "Login berhasil",
      token,
      role: user.user_role?.user_role_name,
      user_role_id: user.user_role?.user_role_id,
      redirect_to: redirect_to,
      user: {
        id: user.user_id,
        email: user.email,
        display_name: user.display_name,
        phone: user.phone_number,
        avatar: user.avatar,
        sub_department_id: user.sub_department_id,
          department: user.department
            ? {
                department_id: user.department.department_id,
                department_name: user.department.department_name,
              }
            : null,
          sub_department: user.sub_department
            ? {
                sub_department_id: user.sub_department.sub_department_id,
                sub_department_name: user.sub_department.sub_department_name,
              }
            : null,

          location: user.location
            ? {
                location_id: user.location.location_id,
                location_name: user.location.location_name,
              }
            : null,
          user_role: user.user_role
            ? {
                user_role_id: user.user_role.user_role_id,
                user_role_name: user.user_role.user_role_name,
              }
            : null,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const profile = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { user_details: true, department: true, sub_department: true, user_role: true, location: true }
    });

    if (!profile) return res.status(404).json({ message: "User tidak ditemukan" });
    return res.json({ profile });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized" });

    const avatarUrl = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : undefined;

    const {
      phone_number,
      display_name, 
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
      termination_date
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.update({
        where: { user_id: userId },
        data: {
          // phone_number,
          // display_name,
          // department_id: department_id ? Number(department_id) : null,
          //  sub_department_id: sub_department_id ? Number(sub_department_id) : null,
          // user_role_id: user_role_id ? Number(user_role_id) : null,
          // location_id: location_id ? Number(location_id) : null,
          // ...(avatarUrl && { avatar: avatarUrl })
          phone_number,
          display_name,
          department_id: department_id ? Number(department_id) : null,
          sub_department_id: sub_department_id ? Number(sub_department_id) : null,
          user_role_id: user_role_id ? Number(user_role_id) : null,
          location_id: location_id ? Number(location_id) : null,
          ...(avatarUrl && { avatar: avatarUrl })
        }
      });

      const details = await tx.user_details.update({
        where: { user_id: userId },
        data: {
          title_prefix,
          full_name,
          title_suffix,
          gender,
          birth_date: birth_date ? new Date(birth_date) : null,
          address,
          employee_status_id: Number(employee_status_id),
          termination_date: termination_date ? new Date(termination_date) : null
        }
      });

      return { user, details };
    });

    return res.json({ message: "Profil berhasil diperbarui", profile: result });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({ include: { user_details: true } });
    return res.json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email tidak ditemukan" });

    // Generate token
    const token = crypto.randomBytes(4).toString('hex'); // 8 characters hex token
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        reset_password_token: token,
        reset_password_expires: expires
      }
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password - Absensi RSUP',
      text: `Anda menerima email ini karena ada permintaan reset password untuk akun Anda.\n\n` +
            `Silakan gunakan token berikut ini di aplikasi:\n\n` +
            `TOKEN: ${token}\n\n` +
            `Jika Anda tidak meminta ini, abaikan email ini dan password Anda akan tetap aman.`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).json({ message: "Gagal mengirim email", error: err.message });
      }
      console.log('Email sent: ' + info.response);
      return res.json({ 
        message: "Link reset password telah dikirim ke email anda" 
      });
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await prisma.users.findFirst({
        where: {
            reset_password_token: token,
            reset_password_expires: { gt: new Date() }
        }
    });

    if (!user) return res.status(400).json({ message: "Token tidak valid atau kadaluarsa" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
        where: { user_id: user.user_id },
        data: {
            password_hash: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null
        }
    });

    return res.json({ message: "Password berhasil diubah" });

  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
  }
};