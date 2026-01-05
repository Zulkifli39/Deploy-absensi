import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";

const JamKerja = () => {
  const [schedulePeriods, setSchedulePeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [userShiftSchedule, setUserShiftSchedule] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchSchedulePeriods = async () => {
    try {
      const res = await axiosInstance.get(
        API_PATHS.SCHEDULE_PERIODS.GET_ALL
      );

      const periods = res.data?.data || [];
      setSchedulePeriods(periods);

      // tentukan periode aktif (berdasarkan tanggal hari ini)
      const today = new Date();

      const activePeriod =
        periods.find((p) => {
          const start = new Date(p.start_date);
          const end = new Date(p.end_date);
          return today >= start && today <= end;
        }) || periods[0];

      setSelectedPeriodId(activePeriod?.period_id || null);
    } catch (err) {
      console.error("Gagal fetch schedule periods:", err);
      setSchedulePeriods([]);
    }
  };


  const fetchUserShiftSchedule = async (periodId) => {
    if (!periodId) return;

    try {
      const res = await axiosInstance.get(
        API_PATHS.USER_SHIFT_SCHEDULES.GET_ALL.replace(
          ":period_id",
          periodId
        )
      );

      setUserShiftSchedule(res.data?.data || []);
    } catch (err) {
      console.error("Gagal fetch shift schedule:", err);
      setUserShiftSchedule([]);
    }
  };


  useEffect(() => {
    fetchSchedulePeriods();
  }, []);

  useEffect(() => {
    if (!selectedPeriodId) return;

    setLoading(true);
    fetchUserShiftSchedule(selectedPeriodId).finally(() =>
      setLoading(false)
    );
  }, [selectedPeriodId]);


  const formatHari = (dateString) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
    });

  const formatTanggal = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };


  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <span className="font-semibold">Memuat jadwal kerja...</span>
      </div>
    );
  }

  return (
    <div className="p-4 mt-2 bg-secondary">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <IoIosArrowBack className="text-2xl cursor-pointer" />
        <span className="font-semibold text-[18px]">Jam Kerja</span>
      </div>

      {/* Content */}
      <div className="bg-white p-4 rounded-xl">
        <h1 className="mb-4 font-semibold text-[14px] text-turqoise">
          Jadwal Kerja
        </h1>

        {/* Select Periode */}
        <div className="mb-4">
          <label className="text-sm font-semibold">Periode</label>
          <select
            className="w-full mt-1 p-2 border rounded-lg"
            value={selectedPeriodId || ""}
            onChange={(e) =>
              setSelectedPeriodId(Number(e.target.value))
            }
          >
            {schedulePeriods.map((period) => (
              <option
                key={period.period_id}
                value={period.period_id}
              >
                {period.period_name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="relative overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-secondary-soft border-b">
              <tr className="text-turqoise font-semibold">
                <th className="px-4 py-3">Hari</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Shift</th>
              </tr>
            </thead>

            <tbody>
              {userShiftSchedule.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada jadwal kerja
                  </td>
                </tr>
              )}

              {userShiftSchedule.map((item) => (
                <tr
                  key={item.user_shift_schedule_id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">
                    {formatHari(item.schedule_date)}
                  </td>

                  <td className="px-4 py-3">
                    {formatTanggal(item.schedule_date)}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {item.shift?.shift_name ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JamKerja;
