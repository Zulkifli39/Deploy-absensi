import React, { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { toast } from "react-toastify";

const CreateEditEmployee = ({ open, onClose, onSuccess, selected }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    status_name: "",
    description: "",
    is_active : true,
  });


  useEffect(() => {
    if (selected) {
      setForm({
        status_name: selected.status_name,
        description: selected.description,
        is_active: selected.is_active,
      });
    } else {
      setForm({ status_name: "", description:"", is_active: true });
    }
  }, [selected, open]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (selected) {
        await axiosInstance.put(
          API_PATHS.EMPLOYEE_STATUS.UPDATE.replace(":id", selected.employee_status_id),
          form
        );
        toast.success("Employee Status berhasil diperbarui");
      } else {
        await axiosInstance.post(API_PATHS.EMPLOYEE_STATUS.CREATE, form);
        toast.success("Employee Status berhasil ditambahkan");
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
      title={selected ? "Edit Employee Status" : "Tambah Employee Status"}
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
        <h1>Status Name</h1>
      <input
        className="w-full border p-2 rounded"
        value={form.status_name}
        onChange={(e) =>
          setForm({ ...form, status_name: e.target.value })
        }
      />
        <h1>Description</h1>
       <input
        className="w-full border p-2 rounded"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />
      </div>
    </BaseModal>
  );
};

export default CreateEditEmployee;
