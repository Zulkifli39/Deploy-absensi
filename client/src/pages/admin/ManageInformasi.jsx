import React   from 'react'
import axiosInstance from '../../utils/AxiosInstance'
import { API_PATHS } from '../../utils/ApiPaths'
import BaseModal from '../../components/BaseModal'
import { LuPlus } from 'react-icons/lu'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import InformationListTable from '../../components/table/InformationListTable'
import CreateEditInformation from '../create/CreateEditInformation'

const ManageInformasi = () => {

const [data, setData] = useState([])
const [loading, setLoading] = useState(false)
const [openForm, setOpenForm] = useState(false)
const [selected, setSelected] = useState(null)
const [openDelete, setOpenDelete] = useState(false);


const getInformation = async () => {
    try {
        setLoading(true);
        const res = await axiosInstance.get(API_PATHS.INFORMATION.GET_ALL);
        setData(res.data.data || []);
    } catch {
        toast.error("Gagal mengambil data informasi");
    } finally {
        setLoading(false);
    }
}

const handleDelete = async () => {
    if (!selected) return;

    try {
        await axiosInstance.delete(API_PATHS.INFORMATION.DELETE.replace(":id", selected.information_id))
        toast.success("Informasi berhasil dihapus");
        setOpenDelete(false);
        setSelected(null);
        getInformation();
    } catch {
        toast.error("Gagal menghapus informasi")
    }
    
}

useEffect(() => {
    getInformation();
}, []);

  return (
    <div className='px-4 py-3 w-full'>
     <div className="bg-white p-5 shadow-md rounded-xl">
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-semibold text-turqoise">
                 Manage Informasi
               </h2>
     
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

     <div className='mt-6 bg-white shadow-md rounded-xl '>
        <InformationListTable 
          data ={data}
          loading = {loading}
          onEdit = {(row) => {
            setSelected(row);
            setOpenForm(true);
          }}
          onDelete = {(row) => {
            setSelected(row);
            setOpenDelete(true);
          }}
        />
     </div>

    {openDelete && (
        <BaseModal 
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          title = "Hapus Informasi"
         footer= {
            <div className='flex justify-end gap-2'>
                <button
                  onClick={() => setOpenDelete(false)}
                  className='border px-4 py-2 rounded'
                >
                   Batal
                </button>
                <button onClick={handleDelete}
                className='bg-red-600 text-white px-4 py-2 rounded'>
                   Hapus
                </button>
            </div>
         } 
         >
        <p>Apakah yakin ingin menghapus informasi ini?</p>
        </BaseModal>
    )}

    <CreateEditInformation   
       open={openForm}
       onClose={() => setOpenForm(false)}
       onSuccess={getInformation}
       selected={selected}
    />

    </div>
  )
}

export default ManageInformasi
