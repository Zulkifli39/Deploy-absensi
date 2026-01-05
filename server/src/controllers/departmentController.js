import { prisma } from "../../config/prisma.js";

export const getDepartments = async (req, res) => {
  try {
    const data = await prisma.departments.findMany({
      where: { is_active: true }
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const dept = await prisma.departments.findUnique({
      where: { department_id: id }
    });

    if (!dept) {
      return res.status(404).json({ success: false, message: "Department tidak ditemukan" });
    }

    res.json({ success: true, data: dept });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const createDepartment = async (req, res) => {
  try {
    const { department_name } = req.body;

    const newDept = await prisma.departments.create({
      data: {
        department_name,
        is_active: true,
        created_at: new Date()
      }
    });

    res.json({ success: true, data: newDept });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { department_name, is_active } = req.body;

    const exist = await prisma.departments.findUnique({
      where: { department_id: id }
    });

    if (!exist) {
      return res.status(404).json({ success: false, message: "Department tidak ditemukan" });
    }

    const updated = await prisma.departments.update({
      where: { department_id: id },
      data: {
        department_name: department_name ?? exist.department_name,
        is_active: typeof is_active === "boolean" ? is_active : exist.is_active,
        updated_at: new Date()
      }
    });

    res.json({ success: true, message: "Berhasil update department", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.departments.findUnique({
      where: { department_id: id }
    });

    if (!exist) {
      return res.status(404).json({ success: false, message: "Department tidak ditemukan" });
    }

    await prisma.departments.update({
      where: { department_id: id },
      data: {
        is_active: false,
        updated_at: new Date()
      }
    });

    res.json({ success: true, message: "Department berhasil dihapus (soft delete)" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
