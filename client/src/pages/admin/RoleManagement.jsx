import React, {useEffect, useState} from 'react'
import { LuPlus } from 'react-icons/lu'
import { toast } from 'react-toastify'

import BaseModal from '../../components/BaseModal'
import RoleListTable from '../../components/table/RoleListTable'
import CreateEditRole from '../create/CreateEditRole'
import axiosInstance from '../../utils/AxiosInstance'
import {API_PATHS} from '../../utils/ApiPaths'

import { useUser } from '../../context/UserContext'
import {ROLES} from '../../constants/roles'

const RoleManagement = () => {
   const [data, setData] = useState([])
   const [loading, setLoading] = useState(false)
   const [openForm, setOpenForm] = useState(false)
   const [openDelete, setOpenDelete] = useState(false)
   const [selected, setSelected] = useState(null)

  const {user} = useUser()
  const isAdmin = user?.user_role_id === ROLES.ADMIN

   const getRole = async () => {
    try {
        setLoading(true);
        const res = await axiosInstance.get(API_PATHS.USER_ROLES.GET_ALL)
        setData(res.data.data || []);
    } catch {
        toast.error("Gagal mengambil data role")
    } finally {
        setLoading(false);
    }
   }

   const handleDelete = async () => {
    if (!selected) return;

    try {
        await axiosInstance.delete(API_PATHS.USER_ROLES.DELETE.replace(":id", selected.user_role_id))
        toast.success("Role berhasil dihapus");
        setOpenDelete(false);
        setSelected(null);
        getRole();
    } catch {
        toast.error("Gagal menghapus role")
    }
   }

   useEffect(() => {
  getRole();
}, []);

    return (
    <div className='px-4 py-3 w-full'>
      <div className="bg-white p-5 shadow-md rounded-xl">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-turqoise">
              Manage Role RS
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

      {/* Table */}
      <div className="mt-6 bg-white shadow-md rounded-xl">
        <RoleListTable
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

      <CreateEditRole
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={getRole}
        selected={selected}
      />
    </div>
  )
}

export default RoleManagement;