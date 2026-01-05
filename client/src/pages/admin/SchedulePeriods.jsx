import React, { useEffect, useState } from "react";
import { LuFileSpreadsheet, LuPlus } from "react-icons/lu";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import CreateEditSchedulePeriods from "../create/CreateEditShiftSchedules";
import { toast } from "react-toastify";
import DeleteAlert from "../../components/DeleteAlert";
import BaseModal from "../../components/BaseModal";
import SchedulePeriodsTable from "../../components/table/SchedulePeriodsTable";

const SchedulePeriods = () => {
 const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  const getData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.SCHEDULE_PERIODS.GET_ALL);
      setData(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(
        API_PATHS.SCHEDULE_PERIODS.DELETE.replace(":id", selected.period_id)
      );
      toast.success("SchedulePeriods berhasil dihapus");
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
            Jadwal Periode
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

      <div className="mt-6 bg-white shadow-md rounded-xl">
      <SchedulePeriodsTable
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

    
      <CreateEditSchedulePeriods
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={getData}
        selected={selected}
      />
      <BaseModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Hapus SchedulePeriods"
      >
        <DeleteAlert
          content={`Yakin hapus "${selected?.period_name}"?`}
          onDelete={handleDelete}
        />
      </BaseModal>
    </div>
  );
};

export default SchedulePeriods;
