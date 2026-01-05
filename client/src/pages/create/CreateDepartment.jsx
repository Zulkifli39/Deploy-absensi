import React, { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { toast } from "react-toastify";

const CreateEditDepartment = ({ open, onClose, onSuccess, selected }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    department_name: "",
    is_active: true,
  });


  useEffect(() => {
    if (selected) {
      setForm({
        department_name: selected.department_name,
        is_active: selected.is_active,
      });
    } else {
      setForm({ department_name: "", is_active: true });
    }
  }, [selected, open]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (selected) {
        await axiosInstance.put(
          API_PATHS.DEPARTMENT.UPDATE.replace(":id", selected.department_id),
          form
        );
        toast.success("Department berhasil diperbarui");
      } else {
        await axiosInstance.post(API_PATHS.DEPARTMENT.CREATE, form);
        toast.success("Department berhasil ditambahkan");
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
      title={selected ? "Edit Department" : "Tambah Department"}
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
      <input
        className="w-full border p-2 rounded"
        value={form.department_name}
        onChange={(e) =>
          setForm({ ...form, department_name: e.target.value })
        }
      />
    </BaseModal>
  );
};

export default CreateEditDepartment;
