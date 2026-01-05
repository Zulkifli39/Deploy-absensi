import React, {useEffect, useState} from 'react'
import BaseModal from '../../components/BaseModal'
import axiosInstance from '../../utils/AxiosInstance'
import {API_PATHS} from '../../utils/ApiPaths'
import {toast} from 'react-toastify'

const CreateEditRole = ({open, onClose, onSuccess, selected}) => {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    user_role_name: "",
    is_active: true,
  })

  useEffect(() => {
    if (selected) {
        setForm({
            user_role_name: selected.user_role_name,
            is_active: selected.is_active,
        });
    } else 
        setForm({ user_role_name: "", is_active: true})
  }, [selected, open]);

  const handleSubmit = async () => {
    try {
        setLoading(true);

        if(selected) {
            await axiosInstance.put(
                API_PATHS.USER_ROLES.UPDATE.replace(":id", selected.user_role_id),
                form
            )
            toast.success("Role berhasil diperbarui")
        } else {
            await axiosInstance.post(
                API_PATHS.USER_ROLES.CREATE,
                form
            )
            toast.success("Role berhasil ditambahkan")
        }
        onSuccess();
        onClose();
        }  catch {
            toast.error("Terjadi kesalahan")
        } finally {
            setLoading(false)
        }
    }
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={selected ? "Edit Role" : "Tambah Role"}
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
        value={form.user_role_name}
        onChange={(e) =>
          setForm({ ...form, user_role_name: e.target.value })
        }
      />
    </BaseModal>
  );
};
export default CreateEditRole;
