import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import axiosInstance from "../../utils/AxiosInstance";
import CreateEditSubDepartment from "../create/CreteEditSubDepartment";
import { API_PATHS } from "../../utils/ApiPaths";
import { toast } from "react-toastify";
import DeleteAlert from "../../components/DeleteAlert";
import BaseModal from "../../components/BaseModal";
import SubDepartmentTable from "../../components/table/SubDepartmentTable";
import { useUser } from "../../context/UserContext";
import { ROLES } from "../../constants/roles";

const SubDepartment = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  const { user } = useUser();

  const getData = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        API_PATHS.SUB_DEPARTMENTS.GET_ALL
      );

      let result = res.data.data || [];

    if (user.user_role_id === ROLES.KEPALA_INSTALASI) {
      // Kepala Instalasi lihat semua sub-department di department mereka
      result = result.filter((sd) => sd.department_id === user.department_id);
    } else if (user.user_role_id === ROLES.KEPALA_SUB_INSTALASI) {
      // Sub-Instalasi hanya lihat sub-department mereka sendiri
      result = result.filter((sd) => sd.sub_department_id === user.sub_department_id);
    }

      setData(result);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(
        API_PATHS.SUB_DEPARTMENTS.DELETE.replace(
          ":id",
          selected.sub_department_id
        )
      );
      toast.success("SubDepartment berhasil dihapus");
      setOpenDelete(false);
      getData();
    } catch {
      toast.error("Gagal menghapus SubDepartment");
    }
  };

  useEffect(() => {
    if (user) getData();
  }, [user]);

  return (
    <div className="px-4 py-3 w-full">
      <div className="bg-white p-5 shadow-md rounded-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Sub Department</h2>

          <button
            onClick={() => {
              setSelected(null);
              setOpenForm(true);
            }}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md"
          >
            <LuPlus /> Tambah
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white shadow-md rounded-xl">
        <SubDepartmentTable
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

      <CreateEditSubDepartment
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={getData}
        selected={selected}
      />

      <BaseModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Hapus SubDepartment"
      >
        <DeleteAlert
          content={`Yakin hapus "${selected?.sub_department_name}"?`}
          onDelete={handleDelete}
        />
      </BaseModal>
    </div>
  );
};

export default SubDepartment;
