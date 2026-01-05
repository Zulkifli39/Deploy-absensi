import { prisma } from "../../config/prisma.js";
import { getFaceDescriptor } from "../utils/faceRecognition.js";
import { saveFaceImage } from "../utils/photoUtils.js";

/**
 * GET ALL USER FACES
 */
export const getUserFaces = async (req, res) => {
  try {
    const data = await prisma.user_faces.findMany({
      where: { deleted_at: null },
      include: {
        user: {
          select: {
            user_id: true,
            display_name: true,
            email: true
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
 * GET USER FACE BY FACE ID
 */
export const getUserFaceById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const face = await prisma.user_faces.findUnique({
      where: { user_face_id: id },
      include: {
        user: {
          select: { user_id: true, display_name: true }
        }
      }
    });

    if (!face || face.deleted_at) {
      return res.status(404).json({ success: false, message: "User face tidak ditemukan" });
    }

    res.json({ success: true, data: face });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET ALL FACES BY USER ID
 */
export const getFacesByUserId = async (req, res) => {
  try {
    const user_id = Number(req.params.user_id);

    const existUser = await prisma.users.findUnique({
      where: { user_id }
    });

    if (!existUser) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    const faces = await prisma.user_faces.findMany({
      where: {
        user_id,
        deleted_at: null
      },
      orderBy: { user_face_id: "asc" }
    });

    res.json({
      success: true,
      count: faces.length,
      data: faces
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createUserFace = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id wajib diisi"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Foto wajah wajib diunggah"
      });
    }

    const existUser = await prisma.users.findUnique({
      where: { user_id: Number(user_id) }
    });

    if (!existUser) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    // Hitung face aktif user
    const faceCount = await prisma.user_faces.count({
      where: {
        user_id: Number(user_id),
        deleted_at: null
      }
    });

    if (faceCount >= 3) {
      return res.status(400).json({
        success: false,
        message: "User sudah memiliki maksimal 3 wajah"
      });
    }

    // 1. Dapatkan descriptor wajah dari buffer
    const descriptor = await getFaceDescriptor(req.file.buffer);

    if (!descriptor) {
      return res.status(400).json({
        success: false,
        message: "Wajah tidak terdeteksi pada foto. Pastikan wajah terlihat jelas."
      });
    }

    // 2. Simpan foto ke storage
    const face_image_url = await saveFaceImage(req.file.buffer, user_id);

    // 3. Simpan ke database
    const newFace = await prisma.user_faces.create({
      data: {
        user_id: Number(user_id),
        face_image_url,
        descriptor: JSON.stringify(Array.from(descriptor)),
        created_at: new Date()
      }
    });

    res.json({ 
      success: true, 
      message: "Wajah berhasil didaftarkan",
      data: newFace 
    });

  } catch (err) {
    console.error("CREATE USER FACE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE USER FACE
 */
export const updateUserFace = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { face_image_url } = req.body;

    const exist = await prisma.user_faces.findUnique({
      where: { user_face_id: id }
    });

    if (!exist || exist.deleted_at) {
      return res.status(404).json({ success: false, message: "User face tidak ditemukan" });
    }

    const updated = await prisma.user_faces.update({
      where: { user_face_id: id },
      data: {
        face_image_url: face_image_url ?? exist.face_image_url
      }
    });

    res.json({
      success: true,
      message: "Berhasil update user face",
      data: updated
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * SOFT DELETE USER FACE
 */
export const deleteUserFace = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.user_faces.findUnique({
      where: { user_face_id: id }
    });

    if (!exist || exist.deleted_at) {
      return res.status(404).json({ success: false, message: "User face tidak ditemukan" });
    }

    // soft delete
    await prisma.user_faces.update({
      where: { user_face_id: id },
      data: { deleted_at: new Date() }
    });

    res.json({ success: true, message: "User face berhasil dihapus (soft delete)" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
