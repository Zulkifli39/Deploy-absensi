import { prisma } from "../../config/prisma.js";

/**
 * GET ALL SUB DEPARTMENTS
 */
export const getSubDepartments = async (req, res) => {
  try {
    const data = await prisma.sub_departments.findMany({
      where: { is_active: true },
      include: {
        department: {
          select: {
            department_id: true,
            department_name: true
          }
        }
      }
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET SUB DEPARTMENT BY ID
 */
export const getSubDepartmentById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const sub = await prisma.sub_departments.findUnique({
      where: { sub_department_id: id },
      include: {
        department: {
          select: {
            department_id: true,
            department_name: true
          }
        }
      }
    });

    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "Sub department tidak ditemukan"
      });
    }

    res.json({ success: true, data: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET SUB DEPARTMENTS BY DEPARTMENT
 */
export const getSubDepartmentsByDepartment = async (req, res) => {
  try {
    const department_id = Number(req.params.department_id);

    const data = await prisma.sub_departments.findMany({
      where: {
        department_id,
        is_active: true
      }
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * CREATE SUB DEPARTMENT
 */
export const createSubDepartment = async (req, res) => {
  try {
    const { department_id, sub_department_name } = req.body;

    if (!department_id || !sub_department_name) {
      return res.status(400).json({
        success: false,
        message: "department_id dan sub_department_name wajib diisi"
      });
    }

    // pastikan department ada
    const department = await prisma.departments.findUnique({
      where: { department_id }
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department tidak ditemukan"
      });
    }

    const newSub = await prisma.sub_departments.create({
      data: {
        department_id,
        sub_department_name,
        is_active: true,
        created_at: new Date()
      }
    });

    res.json({ success: true, data: newSub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE SUB DEPARTMENT
 */
export const updateSubDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { sub_department_name, is_active } = req.body;

    const exist = await prisma.sub_departments.findUnique({
      where: { sub_department_id: id }
    });

    if (!exist) {
      return res.status(404).json({
        success: false,
        message: "Sub department tidak ditemukan"
      });
    }

    const updated = await prisma.sub_departments.update({
      where: { sub_department_id: id },
      data: {
        sub_department_name: sub_department_name ?? exist.sub_department_name,
        is_active: typeof is_active === "boolean" ? is_active : exist.is_active,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: "Berhasil update sub department",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE (SOFT DELETE) SUB DEPARTMENT
 */
export const deleteSubDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.sub_departments.findUnique({
      where: { sub_department_id: id }
    });

    if (!exist) {
      return res.status(404).json({
        success: false,
        message: "Sub department tidak ditemukan"
      });
    }

    await prisma.sub_departments.update({
      where: { sub_department_id: id },
      data: {
        is_active: false,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: "Sub department berhasil dihapus (soft delete)"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
