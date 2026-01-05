import { prisma } from "../../config/prisma.js";

/**
 * GET ALL LOCATIONS (hanya yang belum terhapus)
 */
export const getLocations = async (req, res) => {
  try {
    const data = await prisma.locations.findMany({
      where: { deleted_at: null },
      orderBy: { location_id: "asc" }
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET LOCATION BY ID
 */
export const getLocationById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const location = await prisma.locations.findUnique({
      where: { location_id: id }
    });

    if (!location || location.deleted_at) {
      return res.status(404).json({ success: false, message: "Location tidak ditemukan" });
    }

    res.json({ success: true, data: location });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * CREATE LOCATION
 */
export const createLocation = async (req, res) => {
  try {
    const {
      location_name,
      address,
      latitude,
      longitude,
      radius_meter
    } = req.body;

    if (!location_name || !latitude || !longitude || !radius_meter) {
      return res.status(400).json({
        success: false,
        message: "location_name, latitude, longitude, radius_meter wajib diisi"
      });
    }

    const newLocation = await prisma.locations.create({
      data: {
        location_name,
        address: address ?? null,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius_meter: Number(radius_meter),
        is_active: true,
        created_at: new Date()
      }
    });

    res.json({ success: true, data: newLocation });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * UPDATE LOCATION
 */
export const updateLocation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      location_name,
      address,
      latitude,
      longitude,
      radius_meter,
      is_active
    } = req.body;

    const exist = await prisma.locations.findUnique({
      where: { location_id: id }
    });

    if (!exist || exist.deleted_at) {
      return res.status(404).json({ success: false, message: "Location tidak ditemukan" });
    }

    const updated = await prisma.locations.update({
      where: { location_id: id },
      data: {
        location_name: location_name ?? exist.location_name,
        address: address ?? exist.address,
        latitude: latitude ? Number(latitude) : exist.latitude,
        longitude: longitude ? Number(longitude) : exist.longitude,
        radius_meter: radius_meter ? Number(radius_meter) : exist.radius_meter,
        is_active: typeof is_active === "boolean" ? is_active : exist.is_active,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: "Location berhasil diperbarui",
      data: updated
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * SOFT DELETE LOCATION
 */
export const deleteLocation = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exist = await prisma.locations.findUnique({
      where: { location_id: id }
    });

    if (!exist || exist.deleted_at) {
      return res.status(404).json({ success: false, message: "Location tidak ditemukan" });
    }

    await prisma.locations.update({
      where: { location_id: id },
      data: {
        deleted_at: new Date(),
        is_active: false
      }
    });

    res.json({
      success: true,
      message: "Location berhasil dihapus (soft delete)"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
