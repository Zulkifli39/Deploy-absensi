import React, { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { toast } from "react-toastify";

const CreateEditLocations = ({ open, onClose, onSuccess, selected }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    location_name: "",
    address: "",
    latitude: "",
    longitude: "",
    radius_meter: "",
    is_active: true,
  });

  useEffect(() => {
    if (selected) {
      setForm({
        location_name: selected.location_name,
        address: selected.address,
        latitude: selected.latitude,
        longitude: selected.longitude,
        radius_meter: selected.radius_meter,
        is_active: selected.is_active,
      });
    } else {
      setForm({ location_name: "", address: "", latitude: "", longitude: "", radius_meter: "", is_active: true });
    }
  }, [selected, open]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (selected) {
        await axiosInstance.put(
          API_PATHS.LOCATION.UPDATE.replace(":id", selected.location_id),
          form
        );
        toast.success("Locations berhasil diperbarui");
      } else {
        await axiosInstance.post(API_PATHS.LOCATION.CREATE, form);
        toast.success("Locations berhasil ditambahkan");
      }

      onSuccess();
      onClose();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={selected ? "Edit Locations" : "Tambah Locations"}
      footer={
        <>
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-turqoise text-white px-4 py-2 rounded"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </>
      }
    >
    <div className="space-y-2">
    <div>
       <h1 class>Location Name</h1>
        <input
        className="w-full border p-2 rounded"
        value={form.location_name}
        onChange={(e) =>
          setForm({ ...form, location_name: e.target.value })
        }
        />
    </div>
    <div>
        <h1>Address</h1>
        <input
        className="w-full border p-2 rounded mt-2"
        value={form.address}
        onChange={(e) =>
          setForm({ ...form, address: e.target.value })
        }
      />
    </div>
    <div>
        <h1>Latitude</h1>
        <input
        className="w-full border p-2 rounded mt-2"
        value={form.latitude}
        onChange={(e) =>
          setForm({ ...form, latitude: e.target.value })
        }
      />
    </div>
    <div>
        <h1>Longitude</h1>
        <input
        className="w-full border p-2 rounded mt-2"
        value={form.longitude}
        onChange={(e) =>
          setForm({ ...form, longitude: e.target.value })
        }
      />
    </div>
    <div>
        <h1>Radius Meter</h1>
        <input
        className="w-full border p-2 rounded mt-2"
        value={form.radius_meter}
        onChange={(e) =>
          setForm({ ...form, radius_meter: e.target.value })
        }
         />
    </div>
    </div>
    
     
    </BaseModal>
  );
};

export default CreateEditLocations;
