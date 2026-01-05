import { prisma } from "../../config/prisma.js";

/**
 * GET all employee status
 */
export const getEmployeeStatus = async (req, res) => {
  try {
    const data = await prisma.employee_status.findMany({
      orderBy: { employee_status_id: "asc" }
    });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET employee status by ID
 */
export const getEmployeeStatusById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const status = await prisma.employee_status.findUnique({
      where: { employee_status_id: id }
    });

    if (!status) {
      return res.status(404).json({
        success: false,
        message: "Employee status tidak ditemukan"
      });
    }

    res.json({ success: true, data: status });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * CREATE employee status
 */
export const createEmployeeStatus = async (req, res) => {
  try {
    const { status_name, description, is_active } = req.body;

    if (!status_name) {
      return res.status(400).json({
        success: false,
        message: "status_name wajib diisi"
      });
    }

    const newStatus = await prisma.employee_status.create({
      data: {
        status_name,
        description: description ?? null,
        is_active: is_active ?? true,
        created_at: new Date()
      }
    });

    res.json({ success: true, data: newStatus });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE employee status
 */
export const updateEmployeeStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status_name, description, is_active } = req.body;

    const exist = await prisma.employee_status.findUnique({
      where: { employee_status_id: id }
    });

    if (!exist) {
      return res.status(404).json({
        success: false,
        message: "Employee status tidak ditemukan"
      });
    }

    const updated = await prisma.employee_status.update({
      where: { employee_status_id: id },
      data: {
        status_name: status_name ?? exist.status_name,
        description: description ?? exist.description,
        is_active: typeof is_active === "boolean" ? is_active : exist.is_active,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: "Employee status berhasil diperbarui",
      data: updated
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const deactivateEmployeeStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.employee_status.findUnique({
      where: { employee_status_id: id }
    });

    if (!exist) {
      return res.status(404).json({
        success: false,
        message: "Employee status tidak ditemukan"
      });
    }

    const updated = await prisma.employee_status.update({
      where: { employee_status_id: id },
      data: {
        is_active: false,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: "Employee status berhasil dinonaktifkan",
      data: updated
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
