import { prisma } from "../../config/prisma.js";

export const getLeaveTypes = async (req, res) => {
  try {
    const data = await prisma.leave_types.findMany({
      where: { is_active: true }
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getLeaveTypeById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const item = await prisma.leave_types.findUnique({
      where: { leave_type_id: id }
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Leave type tidak ditemukan" });
    }

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const createLeaveType = async (req, res) => {
  try {
    const { name, description, requires_attachment } = req.body;

    const newType = await prisma.leave_types.create({
      data: {
        name,
        description,
        requires_attachment: requires_attachment ?? false,
        is_active: true,
        created_at: new Date()
      }
    });

    res.json({ success: true, data: newType });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const updateLeaveType = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, requires_attachment, is_active } = req.body;

    const exist = await prisma.leave_types.findUnique({
      where: { leave_type_id: id }
    });

    if (!exist) {
      return res.status(404).json({ success: false, message: "Leave type tidak ditemukan" });
    }

    const updated = await prisma.leave_types.update({
      where: { leave_type_id: id },
      data: {
        name: name ?? exist.name,
        description: description ?? exist.description,
        requires_attachment:
          typeof requires_attachment === "boolean"
            ? requires_attachment
            : exist.requires_attachment,
        is_active: typeof is_active === "boolean" ? is_active : exist.is_active,
        updated_at: new Date()
      }
    });

    res.json({ success: true, message: "Berhasil update leave type", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const deleteLeaveType = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.leave_types.findUnique({
      where: { leave_type_id: id }
    });

    if (!exist) {
      return res.status(404).json({ success: false, message: "Leave type tidak ditemukan" });
    }

    await prisma.leave_types.update({
      where: { leave_type_id: id },
      data: {
        is_active: false,
        updated_at: new Date()
      }
    });

    res.json({ success: true, message: "Leave type berhasil dinonaktifkan" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
