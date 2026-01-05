import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { toast } from "react-toastify";
import { BiSolidUserDetail } from "react-icons/bi";
import BaseModal from "../BaseModal";

const UploadShiftTable = () => {
  const [periodId, setPeriodId] = useState("");
  const [schedulePeriods, setSchedulePeriods] = useState([]);
  const [users, setUsers] = useState([]);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(null);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchSchedulePeriods();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.GET_ALL);
      setUsers(res.data?.data || []);
    } catch {
      toast.error("Gagal memuat user");
    }
  };

  const fetchSchedulePeriods = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.SCHEDULE_PERIODS.GET_ALL);
      setSchedulePeriods(res.data?.data || []);
    } catch {
      toast.error("Gagal memuat periode");
    }
  };

  /* ================= USER MAP ================= */
  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.user_id] = u;
    });
    return map;
  }, [users]);

  /* ================= ACTION ================= */
  const handleDownloadTemplate = async () => {
    if (!periodId) {
      toast.error("Pilih periode terlebih dahulu");
      return;
    }

    try {
      const res = await axiosInstance.get(
        API_PATHS.USER_SHIFT_SCHEDULES.TEMPLATE_EXCEL.replace(
          ":period_id",
          periodId
        ),
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "template_jadwal.xlsx";
      link.click();
    } catch {
      toast.error("Gagal download template");
    }
  };

  const handlePreview = async () => {
    if (!file || !periodId) {
      toast.error("Periode & file wajib diisi");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axiosInstance.post(
        API_PATHS.USER_SHIFT_SCHEDULES.PREVIEW_EXCEL.replace(
          ":period_id",
          periodId
        ),
        formData
      );
      setPreview(res.data);
      toast.success("Preview berhasil");
    } catch (err) {
      toast.error(err.response?.data?.message || "Preview gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !periodId) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await axiosInstance.post(
        API_PATHS.USER_SHIFT_SCHEDULES.UPLOAD_EXCEL.replace(
          ":period_id",
          periodId
        ),
        formData
      );
      toast.success("Jadwal berhasil disimpan");
      setPreview(null);
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload gagal");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            className="border p-2 rounded w-72"
          >
            <option value="">-- Pilih Periode --</option>
            {schedulePeriods.map((p) => (
              <option key={p.period_id} value={p.period_id}>
                {p.period_name} ({p.start_date?.slice(0, 10)} -{" "}
                {p.end_date?.slice(0, 10)})
              </option>
            ))}
          </select>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Download Template
          </button>

          <button
            onClick={handlePreview}
            disabled={loading}
            className="bg-turqoise text-white px-4 py-2 rounded"
          >
            Preview
          </button>

          {preview && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Upload & Simpan
            </button>
          )}
        </div>
      </div>

      {/* PREVIEW */}
      {preview && (
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Ringkasan</p>
            <ul className="text-sm space-y-2 mt-2">
              <li>Total User: {preview.summary.total_users}</li>
              <li>Total Hari: {preview.summary.total_days}</li>
              <li>Total Jadwal: {preview.summary.total_records}</li>
            </ul>
          </div>

          <div className="overflow-x-auto border">
            <table className="min-w-full  text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b px-2 py-2 text-[14px] font-bold">Nama</th>
                  <th className="border-b px-2 py-2 text-[14px] font-bold">Email</th>
                  <th className="border-b px-2 py-2 text-[14px] font-bold">No HP</th>
                  <th className="border-b px-2 py-2 text-[14px] font-bold">Total Jadwal</th>
                  <th className="border-b px-2 py-2 text-[14px] font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {preview.users.map((u) => {
                  const user = userMap[u.user_id];
                  return (
                    <tr key={u.user_id}>
                      <td className=" px-2 py-2 text-[14px] font-medium text-center">
                        {user?.display_name || "-"}
                      </td>
                      <td className=" px-2 py-2 text-[14px] font-medium text-center">
                        {user?.email || "-"}
                      </td>
                      <td className=" px-2 py-2 text-[14px] font-medium text-center">
                        {user?.phone_number || "-"}
                      </td>
                      <td className=" px-2 py-2 text-[14px] font-medium text-center">
                        {u.schedules.length}
                      </td>
                      <td className=" px-2 py-2 text-[14px] font-medium flex items-center  justify-center text-center   ">
                        <button
                          onClick={() => {
                            setSelected({
                              user,
                              schedules: u.schedules
                            });
                            setOpenModal(true);
                          }}
                          className="flex items-center gap-4 bg-turqoise text-white cursor-pointer px-2 py-2 text-[14px] font-medium rounded"
                        >
                          <BiSolidUserDetail />
                          Lihat Jadwal
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      <BaseModal
        open={openModal}
        title="Detail Jadwal User"
        onClose={() => {
            setOpenModal(false);
            setSelected(null);
        }}
        footer={null}
        >
  {selected && (
    <div className="space-y-4">
      {/* INFO USER */}
      <div className="border-b pb-2 text-sm space-y-2">
        <p className="text-[16px]"><b>Nama:</b> {selected.user?.display_name}</p>
        <p className="text-[16px]"><b>Email:</b> {selected.user?.email}</p>
        <p className="text-[16px]"><b>No HP:</b> {selected.user?.phone_number}</p>
      </div>

      {/* JADWAL HORIZONTAL */}
      <div className="overflow-x-auto mb-10">
        <table className="border-collapse text-xs h-42">
          <thead>
            <tr>
              {selected.schedules.map((s, idx) => (
                <th
                  key={idx}
                  className="border px-3 py-2 text-center bg-gray-100 whitespace-nowrap"
                >
                  {s.date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {selected.schedules.map((s, idx) => (
                <td
                  key={idx}
                  className="border px-3 py-2 text-center font-semibold whitespace-nowrap"
                >
                  {s.shift_code}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )}
</BaseModal>


    </div>
  );
};

export default UploadShiftTable;
