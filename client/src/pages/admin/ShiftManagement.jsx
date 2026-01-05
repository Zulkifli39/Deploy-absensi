import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";

import BaseModal from "../../components/BaseModal";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import ShiftTable from "../../components/table/ShiftTable";
import CreateEditShift from "../create/CreateEditShift";
import { useUser } from "../../context/UserContext";
import { ROLES } from "../../constants/roles";

const ShiftManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  const { user } = useUser();

  const isAdmin = user?.user_role_id === ROLES.ADMIN;

  // 🔹 Fetch Departments sesuai role
  const getDepartments = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DEPARTMENT.GET_ALL);
      let result = res.data.data || [];

      if (user) {
        switch (user.user_role_id) {
          case ROLES.ADMIN:
            // Admin lihat semua department
            break;

          case ROLES.KEPALA_INSTALASI:
          case ROLES.KEPALA_SUB_INSTALASI:
            // Kepala Instalasi/Sub Instalasi hanya lihat department mereka
            result = result.filter(
              (d) => d.department_id === user.department_id
            );
            // otomatis set departmentId supaya shift langsung muncul
            if (result.length > 0) setDepartmentId(result[0].department_id.toString());
            break;

          default:
            result = [];
            break;
        }
      }

      setDepartments(result);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data department");
    }
  };

  // 🔹 Fetch Shifts sesuai department
  const getShift = async (deptId = null) => {
    const depId = deptId || departmentId;
    if (!depId) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.SHIFT.GET_ALL, {
        params: { department_id: depId },
      });

      let shifts = res.data.data || [];

      // Filter berdasarkan role user
      if (user) {
        switch (user.user_role_id) {
          case ROLES.ADMIN:
          case ROLES.KEPALA_INSTALASI:
            // Admin & Kepala Instalasi lihat semua shift di department
            shifts = shifts.filter(
              (s) => s.department_id.toString() === depId.toString()
            );
            break;

          case ROLES.KEPALA_SUB_INSTALASI:
            // Kepala Sub Instalasi hanya shift di sub department mereka
            shifts = shifts.filter(
              (s) =>
                s.department_id.toString() === depId.toString() &&
                s.sub_department_id === user.sub_department_id
            );
            break;

          default:
            shifts = [];
            break;
        }
      }

      setData(shifts);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data shift");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete Shift
  const handleDelete = async () => {
    if (!selected) return;

    try {
      await axiosInstance.delete(
        API_PATHS.SHIFT.DELETE.replace(":id", selected.shift_id)
      );
      toast.success("Shift berhasil dihapus");
      setOpenDelete(false);
      setSelected(null);
      getShift();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus shift");
    }
  };

  // 🔹 EFFECTS
  useEffect(() => {
    if (user) getDepartments();
  }, [user]);

  useEffect(() => {
    if (departmentId) getShift();
    else setData([]);
  }, [departmentId, user]);

  return (
    <div className="px-4 py-3 w-full">
      {/* HEADER */}
      <div className="bg-white p-5 shadow-md rounded-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-turqoise">
            Manage Shift RS
          </h2>

          <button
            disabled={!departmentId}
            onClick={() => {
              setSelected(null);
              setOpenForm(true);
            }}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            <LuPlus /> Tambah Shift
          </button>
        </div>

        {/* SELECT DEPARTMENT hanya untuk Admin */}
        {isAdmin && (
          <div className="mt-4">
            <select
              className="border p-2 rounded w-64"
              value={departmentId}
              onChange={(e) => {
                const deptId = e.target.value;
                setDepartmentId(deptId); // set departmentId
                if (deptId) getShift(deptId); // langsung fetch shift sesuai pilihan
                else setData([]); // kosongkan table jika tidak ada
              }}
            >
              <option value="">Pilih Department</option>
              {departments.map((dept) => (
                <option
                  key={dept.department_id}
                  value={dept.department_id.toString()}
                >
                  {dept.department_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="mt-6 bg-white shadow-md rounded-xl">
        <ShiftTable
          data={data}
          loading={loading}
          onEdit={(row) => {
            setSelected(row);
            setOpenForm(true);
          }}
          onDelete={(row) => {
            setSelected(row);
            setOpenDelete(true);
          }}
        />
      </div>

      {/* DELETE MODAL */}
      {openDelete && (
        <BaseModal
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          title="Hapus Shift"
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenDelete(false)}
                className="border px-4 py-2 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Hapus
              </button>
            </div>
          }
        >
          <p>Apakah Anda yakin ingin menghapus shift ini?</p>
        </BaseModal>
      )}

      {/* CREATE / EDIT */}
      <CreateEditShift
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={getShift}
        selected={selected}
        departmentId={departmentId}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default ShiftManagement;
