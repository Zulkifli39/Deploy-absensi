import React, { useEffect, useState } from "react";
import { LuFileSpreadsheet, LuPlus } from "react-icons/lu";
import TaskListTable from "../../components/table/TaskListTable";
import axiosInstance from "../../utils/AxiosInstance";
import CreateEditDepartment from "../create/CreateDepartment";
import { API_PATHS } from "../../utils/ApiPaths";
import { toast } from "react-toastify";
import DeleteAlert from "../../components/DeleteAlert";
import BaseModal from "../../components/BaseModal";
import { useUser } from "../../context/UserContext";
import { ROLES } from "../../constants/roles";

const Department = () => {
 const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  const { user } = useUser();
  const isAdmin = user?.user_role_id === ROLES.ADMIN;

  // const getData = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axiosInstance.get(API_PATHS.DEPARTMENT.GET_ALL);
  //     setData(res.data.data || []);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.DEPARTMENT.GET_ALL);
      let result = res.data.data || [];

      if (user.user_role_id === ROLES.KEPALA_INSTALASI) {
        // Kepala Instalasi lihat semua sub-department di department mereka
        result = result.filter((sd) => sd.department_id === user.department_id);
      } else if (user.user_role_id === ROLES.KEPALA_SUB_INSTALASI) {
        // Sub-Instalasi hanya lihat sub-department mereka sendiri
        result = result.filter((sd) => sd.department_id === user.department_id);
      }

      setData(result);
    } finally {
      setLoading(false);
    }
  }


  const handleDelete = async () => {
    try {
      await axiosInstance.delete(
        API_PATHS.DEPARTMENT.DELETE.replace(":id", selected.department_id)
      );
      toast.success("Department berhasil dihapus");
      setOpenDelete(false);
      getData();
    } catch {
      toast.error("Gagal menghapus department");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="px-4 py-3 w-full">

      {/* HEADER */}
      <div className="bg-white p-5 shadow-md rounded-xl">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold text-turqoise">
            Department
          </h2>

        {isAdmin && (
          <button
            onClick={() => {
              setSelected(null);
              setOpenForm(true);
            }}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md"
          >
            <LuPlus /> Tambah
          </button>
        )}
        </div>
      </div>

      <div className="mt-6 bg-white shadow-md rounded-xl">
      <TaskListTable
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

    
      <CreateEditDepartment
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={getData}
        selected={selected}
      />
      <BaseModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Hapus Department"
      >
        <DeleteAlert
          content={`Yakin hapus "${selected?.department_name}"?`}
          onDelete={handleDelete}
        />
      </BaseModal>
    </div>
  );
};

export default Department;
