import React, { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import { ROLES } from "../../constants/roles";

const CreateEditShift = ({
  open,
  onClose,
  onSuccess,
  selected,
  departmentId
}) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const { user } = useUser();

  const [form, setForm] = useState({
    shift_code: "",
    departmentId : "",
    shift_name: "",
    shift_type: "",
    checkin_time: "",
    checkout_time: "",
    is_next_day: false,
    department_id: ""
  });

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }

    if (selected) {
      setForm({
        shift_code: selected.shift_code,
        departmentId: selected.department_id,
        shift_name: selected.shift_name,
        shift_type: selected.shift_type || "",
        checkin_time: selected.checkin_time,
        checkout_time: selected.checkout_time,
        is_next_day: selected.is_next_day,
        department_id: selected.department_id
      });
    } else {
      setForm({
        shift_code: "",
        departmentId : "",
        shift_name: "",
        shift_type: "",
        checkin_time: "",
        checkout_time: "",
        is_next_day: false,
        department_id: departmentId
      });
    }
  }, [selected, open, departmentId]);

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DEPARTMENT.GET_ALL);
      let result = res.data.data || [];

      // Filter department sesuai user role
      if (user.user_role_id !== ROLES.ADMIN) {
        result = result.filter((d) => d.department_id === user.department_id);
      }

      setDepartments(result);
    } catch {
      toast.error("Gagal mengambil data department");
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        ...form,
        department_id: Number(form.department_id || departmentId),
        is_next_day: !!form.is_next_day,
      };

      if (selected) {
        await axiosInstance.put(
          API_PATHS.SHIFT.UPDATE.replace(":id", selected.shift_id),
          payload
        );
        toast.success("Shift berhasil diperbarui");
      } else {
        await axiosInstance.post(API_PATHS.SHIFT.CREATE, payload);
        toast.success("Shift berhasil ditambahkan");
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={selected ? "Edit Shift" : "Tambah Shift"}
      footer={
        <>
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`bg-blue-600 text-white px-4 py-2 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Row 1 */}
        <div>
          <label className="text-sm font-medium mb-1 block">Shift Code</label>
           <input
          className="w-full border p-2 rounded"
          placeholder="Shift Code"
          value={form.shift_code}
          onChange={(e) =>
            setForm({ ...form, shift_code: e.target.value })
          }/>
        </div>
     
        {/* Row */}
        <div>
          <label className="text-sm font-medium mb-1 block">Departments</label>
           <select
          className="w-full border p-2 rounded"
          value={form.department_id}
          onChange={(e) =>
            setForm({ ...form, department_id: e.target.value })
          }
          >
          <option value="">Pilih Department</option>
          {departments.map((dept) => (
            <option key={dept.department_id} value={dept.department_id}>
              {dept.department_name}
            </option>
          ))}
           </select>
        </div>
       
       {/* Row 3*/}
       <div>
          <label className="text-sm font-medium mb-1 block">Shift Name</label>
          <input
          className="w-full border p-2 rounded"
          placeholder="Shift Name"
          value={form.shift_name}
          onChange={(e) =>
            setForm({ ...form, shift_name: e.target.value })
          }
        />
       </div>
        
       {/* Row 4 */}
       <div>
          <label className="text-sm font-medium mb-1 block">Shift Type</label>
             <input
          className="w-full border p-2 rounded"
          placeholder="Shift Type"
          value={form.shift_type}
          onChange={(e) =>
            setForm({ ...form, shift_type: e.target.value })
          }/>
       </div>

       {/* Row 5 */}
       <div>
        <label className="text-sm font-medium mb-1 block">Checkin Time</label>
          <input
          type="time"
          className="w-full border p-2 rounded"
          value={form.checkin_time}
          onChange={(e) =>
            setForm({ ...form, checkin_time: e.target.value })
          }
        />
       </div>
      
       {/* Row 6 */}
       <div>
        <label className="text-sm font-medium mb-1 block">Checkout Time</label>
            <input
          type="time"
          className="w-full border p-2 rounded"
          value={form.checkout_time}
          onChange={(e) =>
            setForm({ ...form, checkout_time: e.target.value })
          }
        />
       </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_next_day}
            onChange={(e) =>
              setForm({ ...form, is_next_day: e.target.checked })
            }
          />
          <span>Shift melewati hari berikutnya</span>
        </label>
      </div>
    </BaseModal>
  );
};

export default CreateEditShift;
