import React, { useEffect, useState, useMemo } from "react";
import { LuPlus } from "react-icons/lu";
import { toast } from "react-toastify";

import BaseModal from "../../components/BaseModal";
import UserListTable from "../../components/table/UserListTable";
import CreateEditUsers from "../create/CreateEditUsers";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { useUser } from "../../context/UserContext";
import { ROLES } from "../../constants/roles";
import useDebounce from "../../utils/UseDebounceFilter";

const ManageUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const { user } = useUser();

  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 500);

  // Filtered Data berdasarkan searchText
  const filteredData = useMemo(() => {
    if (!debouncedSearchText) return data;

    const lowerSearch = debouncedSearchText.toLowerCase();

    return data.filter((row) => {
      return (
        row.display_name?.toLowerCase().includes(lowerSearch) ||
        row.employee_id_number?.toLowerCase().includes(lowerSearch) ||
        row.phone_number?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [data, debouncedSearchText]);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.USERS.GET_ALL);
      let result = res.data?.data || [];

      if (user.user_role_id === ROLES.KEPALA_INSTALASI) {
        result = result.filter(
          (d) => d.department_id === user.department_id
        );
      } else if (user.user_role_id === ROLES.KEPALA_SUB_INSTALASI) {
        result = result.filter(
          (d) => d.sub_department_id === user.sub_department_id
        );
      }

      setData(result);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    try {
      await axiosInstance.delete(
        API_PATHS.USERS.DELETE.replace(":id", selected.user_id)
      );
      toast.success("User berhasil dihapus");
      setOpenDelete(false);
      setSelected(null);
      getUsers();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus user");
    }
  };

  useEffect(() => {
    if (user) getUsers();
  }, [user]);

  return (
    <div className="px-4 py-3 w-full">
      {/* Header */}
      <div className="bg-white p-5 shadow-md rounded-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-turqoise">
            Manage Users
          </h2>
             {/* Search Input */}
        <div className="flex justify-between gap-3">
          <input
            type="text"
            placeholder="Cari user..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border p-2 rounded "
          />
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

     
      </div>

      {/* Table */}
      <div className="mt-6 bg-white shadow-md rounded-xl">
        <UserListTable
          data={filteredData} // Gunakan filteredData
          loading={loading}
          onEdit={(row) => {
            setSelected(row);
            setOpenForm(true);
          }}
          onDelete={(row) => {
            setSelected(row);
            setOpenDelete(true);
          }}
          onDetail={(row) => {
            setSelected(row);
            setOpenForm(true);
          }}
        />
      </div>

      {openDelete && (
        <BaseModal
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          title="Hapus User"
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
          <p>Apakah Anda yakin ingin menghapus user ini?</p>
        </BaseModal>
      )}

      <CreateEditUsers
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={getUsers}
        selected={selected}
      />
    </div>
  );
};

export default ManageUsers;
