import { prisma } from "../../config/prisma.js";

export const getAllUsers = async (req, res) => {
  try {
    const data = await prisma.users.findMany({
      where: { deleted_at: null },
      include: { user_details: true }
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.users.findUnique({
      where: { user_id: id },
      include: { user_details: true }
    });

    if (!user || user.deleted_at) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const createUser = async (req, res) => {
  try {
    const {
      national_id_number,
      employee_id_number,
      email,
      username,
      password_hash,
      phone_number,
      display_name,
      department_id,
      user_role_id,
      location_id,

      // detail
      full_name,
      title_prefix,
      title_suffix,
      gender,
      birth_date,
      address,
      employee_status_id
    } = req.body;

    // Generate Display Name
    const generatedDisplayName = [title_prefix, full_name, title_suffix]
      .filter((part) => part && part.trim() !== "")
      .join(" ");

    const newUser = await prisma.users.create({
      data: {
        national_id_number,
        employee_id_number,
        email,
        password_hash,
        phone_number,
        display_name: generatedDisplayName,
        department_id,
        user_role_id,
        location_id,
        is_active: true,
        created_at: new Date(),

        user_details: {
          create: {
            full_name,
            title_prefix,
            title_suffix,
            gender,
            birth_date,
            address,
            employee_status_id,
            created_at: new Date()
          }
        }
      },
      include: { user_details: true }
    });

    res.json({ success: true, data: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.users.findUnique({
      where: { user_id: id },
      include: { user_details: true }
    });

    if (!exist || exist.deleted_at) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    const {
      email,
      phone_number,
      display_name,

      full_name,
      address,
      gender
    } = req.body;

    const updated = await prisma.users.update({
      where: { user_id: id },
      data: {
        email: email ?? exist.email,
        phone_number: phone_number ?? exist.phone_number,
        display_name: display_name ?? exist.display_name,
        updated_at: new Date(),

        user_details: {
          update: {
            full_name: full_name ?? exist.user_details.full_name,
            address: address ?? exist.user_details.address,
            gender: gender ?? exist.user_details.gender,
            updated_at: new Date()
          }
        }
      },
      include: { user_details: true }
    });

    res.json({ success: true, message: "Berhasil update user", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.users.findUnique({
      where: { user_id: id }
    });

    if (!exist || exist.deleted_at) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    await prisma.users.update({
      where: { user_id: id },
      data: {
        is_active: false,
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });

    await prisma.user_details.update({
      where: { user_id: id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });

    res.json({ success: true, message: "User berhasil dihapus (soft delete)" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
