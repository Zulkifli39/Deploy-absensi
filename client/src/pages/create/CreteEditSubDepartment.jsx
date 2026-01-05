import React, { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";

const CreateEditSubDepartment = ({ open, onClose, onSuccess, selected }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    sub_department_name: "",
    is_active: true,
  });

  useEffect(() => {
    if (selected) {
      setForm({
        sub_department_name: selected.sub_department_name,
        is_active: selected.is_active,
      });
    } else {
      setForm({ sub_department_name: "", is_active: true });
    }
  }, [selected, open]);


const handleSubmit = async () => {
  try {
    setLoading(true);

    const payload = {
      sub_department_name: form.sub_department_name,
      is_active: form.is_active,
      department_id: user.department_id, 
    };

    if (selected) {
      await axiosInstance.put(
        API_PATHS.SUB_DEPARTMENTS.UPDATE.replace(":id", selected.sub_department_id),
        payload
      );
      toast.success("SubDepartment berhasil diperbarui");
    } else {
      await axiosInstance.post(
        API_PATHS.SUB_DEPARTMENTS.CREATE,
        payload
      );
      toast.success("SubDepartment berhasil ditambahkan");
    }

    onSuccess();
    onClose();
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Terjadi kesalahan"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={selected ? "Edit Sub Department" : "Tambah Sub Department"}
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
        <h1>Sub Department</h1>
        <input
          className="w-full border p-2 rounded"
          value={form.sub_department_name}
          onChange={(e) =>
            setForm({ ...form, sub_department_name: e.target.value })
          }
        />
      </div>
    </BaseModal>
  );
};

export default CreateEditSubDepartment;
