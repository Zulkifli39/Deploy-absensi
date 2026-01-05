import { prisma } from "../../config/prisma.js";

/**
 * GET ALL USER ROLES
 */
export const getUserRoles = async (req, res) => {
  try {
    const data = await prisma.user_roles.findMany({
      orderBy: { user_role_id: "asc" }
    });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET USER ROLE BY ID
 */
export const getUserRoleById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const role = await prisma.user_roles.findUnique({
      where: { user_role_id: id }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "User role tidak ditemukan"
      });
    }

    res.json({ success: true, data: role });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * CREATE USER ROLE
 */
export const createUserRole = async (req, res) => {
  try {
    const { user_role_name, is_active } = req.body;

    if (!user_role_name) {
      return res.status(400).json({
        success: false,
        
        message: "user_role_name wajib diisi"
      });
    }

    const newRole = await prisma.user_roles.create({
      data: {
        user_role_name,
        is_active: is_active ?? true,
        created_at: new Date()
      }
    });

    res.json({ success: true, data: newRole });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE USER ROLE
 */
export const updateUserRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { user_role_name, is_active } = req.body;

    const exist = await prisma.user_roles.findUnique({
      where: { user_role_id: id }
    });

    if (!exist) {
      return res.status(404).json({
        success: false,
        message: "User role tidak ditemukan"
      });
    }

    const updated = await prisma.user_roles.update({
      where: { user_role_id: id },
      data: {
        user_role_name: user_role_name ?? exist.user_role_name,
        is_active: typeof is_active === "boolean" ? is_active : exist.is_active,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: "User role berhasil diperbarui",
      data: updated
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DEACTIVATE (soft delete)
 */
export const deactivateUserRole = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.user_roles.findUnique({
      where: { user_role_id: id }
    });

    if (!exist) {
      return res.status(404).json({
        success: false,
        message: "User role tidak ditemukan"
      });
    }

    const updated = await prisma.user_roles.update({
      where: { user_role_id: id },
      data: {
        is_active: false,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: "User role berhasil dinonaktifkan",
      data: updated
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
