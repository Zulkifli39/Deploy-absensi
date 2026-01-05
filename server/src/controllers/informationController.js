import { prisma } from "../../config/prisma.js";

import fs from "fs";
import path from "path";
/**
 * GET all information (hanya yang belum dihapus)
 */
export const getAllInformation = async (req, res) => {
  try {
    const data = await prisma.information.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: {
            user_id: true,
            display_name: true,
            email: true,
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
            }
          }
        },
      }
    });

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET by ID
 */
export const getInformationById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const info = await prisma.information.findUnique({
      where: { information_id: id },
      include: {
        user: {
          select: {
            user_id: true,
            display_name: true
          }
        }
      }
    });

    if (!info || info.deleted_at) {
      return res.status(404).json({ success: false, message: "Informasi tidak ditemukan" });
    }

    res.json({ success: true, data: info });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const createInformation = async (req, res) => {
  try {
    const { title, description } = req.body;

    // title wajib
    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title wajib diisi"
      });
    }

    // description wajib
    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description wajib diisi"
      });
    }

    // image wajib
    if (!req.files?.image) {
      return res.status(400).json({
        success: false,
        message: "Image wajib diupload"
      });
    }

    const imageFile = req.files.image[0];

    if (imageFile.size > 1 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Image maksimal 1MB"
      });
    }

    // pdf opsional
    let pdfUrl = null;
    if (req.files.pdf) {
      const pdfFile = req.files.pdf[0];

      if (pdfFile.size > 2 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "PDF maksimal 2MB"
        });
      }

      pdfUrl = `/uploads/information/pdf/${pdfFile.filename}`;
    }

    const newInfo = await prisma.information.create({
      data: {
        title,
        description,
        image: `/uploads/information/image/${imageFile.filename}`,
        pdf_file_url: pdfUrl,
        created_by: req.user.user_id,
        is_published: true,
        created_at: new Date()
      }
    });

    res.json({
      success: true,
      message: "Information berhasil dibuat",
      data: newInfo
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};




export const updateInformation = async (req, res) => {
  try {
    const informationId = Number(req.params.id);
    const { title, description } = req.body;

    /* ========== VALIDASI TEXT ========== */
    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title wajib diisi"
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description wajib diisi"
      });
    }

    /* ========== CEK DATA LAMA ========== */
    const existing = await prisma.information.findUnique({
      where: { information_id: informationId }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Data information tidak ditemukan"
      });
    }

    const updateData = {
      title,
      description
    };

    /* ========== IMAGE (OPSIONAL) ========== */
    if (req.files?.image) {
      const imageFile = req.files.image[0];

      if (imageFile.size > 1 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Image maksimal 1MB"
        });
      }

      // hapus image lama
      if (existing.image) {
        const oldImagePath = path.join(process.cwd(), existing.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updateData.image = `/uploads/information/image/${imageFile.filename}`;
    }

    /* ========== PDF (OPSIONAL) ========== */
    if (req.files?.pdf) {
      const pdfFile = req.files.pdf[0];

      if (pdfFile.size > 2 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "PDF maksimal 2MB"
        });
      }

      // hapus pdf lama
      if (existing.pdf_file_url) {
        const oldPdfPath = path.join(process.cwd(), existing.pdf_file_url);
        if (fs.existsSync(oldPdfPath)) {
          fs.unlinkSync(oldPdfPath);
        }
      }

      updateData.pdf_file_url = `/uploads/information/pdf/${pdfFile.filename}`;
    }

    /* ========== UPDATE DB ========== */
    const updated = await prisma.information.update({
      where: { information_id: informationId },
      data: updateData
    });

    res.json({
      success: true,
      message: "Information berhasil diupdate",
      data: updated
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



/**
 * SOFT DELETE information
 */
export const deleteInformation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.information.findUnique({
      where: { information_id: id }
    });

    if (!exist || exist.deleted_at) {
      return res.status(404).json({ success: false, message: "Informasi tidak ditemukan" });
    }

    await prisma.information.update({
      where: { information_id: id },
      data: {
        deleted_at: new Date()
      }
    });

    res.json({ success: true, message: "Informasi berhasil dihapus (soft delete)" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};