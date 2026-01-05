import React, { useEffect, useMemo, useState } from "react";
import { LuFileSpreadsheet } from "react-icons/lu";
import { toast } from "react-toastify";
import LaporanTable from "../../components/table/LaporanTable";
import { API_PATHS } from "../../utils/ApiPaths";
import axiosInstance from "../../utils/AxiosInstance";

// Utility Debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const Laporan = () => {
  const [data, setData] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 500); // 500ms debounce

  const fetchData = async (url, setter) => {
    const res = await axiosInstance.get(url);
    setter(res?.data?.data || []);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchData(API_PATHS.ATTENDANCE.GET_ALL, setData),
          fetchData(API_PATHS.SHIFT.GET_ALL, setShifts),
          fetchData(API_PATHS.USERS.GET_ALL, setUsers),
          fetchData(API_PATHS.SCHEDULE_PERIODS.GET_ALL, setPeriods),
        ]);
      } 

      
      catch {
        toast.error("Gagal mengambil data laporan");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // Filter Data Tabel
  const filteredData = useMemo(() => {
  return data.filter((row) => {
    const periodMatch =
      !selectedPeriod || row.period_id === Number(selectedPeriod);

    const dateMatch =
      (!startDate || new Date(row.attendance_date) >= new Date(startDate)) &&
      (!endDate || new Date(row.attendance_date) <= new Date(endDate));

    // Cari user berdasarkan user_id
    const user = users.find((u) => u.user_id === row.user_id);

    const searchMatch =
      !debouncedSearchText ||
      (user?.display_name
        .toLowerCase()
        .includes(debouncedSearchText.toLowerCase()));

    return periodMatch && dateMatch && searchMatch;
  });
}, [data, selectedPeriod, startDate, endDate, debouncedSearchText, users]);


  // Download Semua 
  const handleDownloadAll = async () => {
    if (!selectedPeriod) {
      toast.warning("Silakan pilih periode terlebih dahulu");
      return;
    }

    try {
      const res = await axiosInstance.get(API_PATHS.REPORTS.GET_ALL, {
        params: {
          period_id: selectedPeriod,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
        responseType: "blob",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      const blob = new Blob([res.data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_Absensi_Periode_${selectedPeriod}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh laporan");
    }
  };

  // Download By Id
  const handleDownloadSelectedUsers = async (userId) => {
    if (!selectedPeriod) {
      toast.warning("Pilih periode terlebih dahulu");
      return;
    }
    if (!userId) {
      toast.warning("User tidak valid");
      return;
    }

    try {
      const res = await axiosInstance.get(API_PATHS.REPORTS.GET_BY_ID, {
        params: {
          period_id: selectedPeriod,
          user_id: userId,
        },
        responseType: "blob",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      const blob = new Blob([res.data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_User_${userId}_Periode_${selectedPeriod}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("DOWNLOAD BY ID ERROR:", err);
      toast.error("Gagal mengunduh laporan terpilih");
    }
  };

  // Download By Range Date
  const handleDownloadByRange = async () => {
  if (!selectedPeriod) {
    toast.warning("Pilih periode terlebih dahulu");
    return;
  }

  if (!startDate || !endDate) {
    toast.warning("Silakan pilih rentang tanggal terlebih dahulu");
    return;
  }

  try {
    const res = await axiosInstance.get(
      API_PATHS.REPORTS.GET_BY_RANGE,
      {
        params: {
          period_id: selectedPeriod,
          start_date: startDate,
          end_date: endDate
        },
        responseType: "blob"
      }
    );

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_${selectedPeriod}_${startDate}_sampai_${endDate}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("DOWNLOAD RANGE ERROR:", err);
    toast.error("Gagal mengunduh laporan berdasarkan tanggal");
  }
};

  //  Download By Id User and Range Date
const handleDownloadByIdRangeDate = async (userId) => {
  if (!selectedPeriod) {
    toast.warning("Pilih periode terlebih dahulu");
    return;
  }

  if (!userId) {
    toast.warning("User tidak valid");
    return;
  }

  if (!startDate || !endDate) {
    toast.warning("Silakan pilih rentang tanggal terlebih dahulu");
    return;
  }

  try {
    const res = await axiosInstance.get(
      API_PATHS.REPORTS.GET_BY_ID_AND_RANGE,
      {
        params: {
          period_id: selectedPeriod,
          user_id: userId,
          start_date: startDate,
          end_date: endDate
        },
        responseType: "blob"
      }
    );

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_User_${userId}_${startDate}_sampai_${endDate}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("DOWNLOAD USER RANGE ERROR:", err);
    toast.error("Gagal mengunduh laporan user berdasarkan tanggal");
  }
};

  

  return (
    <div className="px-4 py-3 space-y-4">
      <div className="bg-white p-5 rounded-xl shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold text-turqoise">
          Laporan Absensi
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Periode */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm min-w-[160px]"
          >
            <option value="">Semua Periode</option>
            {periods.map((p) => (
              <option key={p.period_id} value={p.period_id}>
                {p.period_name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <span className="text-sm text-gray-500">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />

          {/* Search Input */}
          <input
            type="text"
            placeholder="Cari nama user..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm min-w-[200px]"

/>

          <button onClick={handleDownloadByRange} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 font-medium">
            <LuFileSpreadsheet />
            Download By Tanggal
          </button>
            

          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-turqoise text-black font-medium"
          >
            <LuFileSpreadsheet />
            Download Semua
          </button>
        </div>
      </div>

      <LaporanTable
        data={filteredData}
        shifts={shifts}
        users={users}
        periods={periods}
        loading={loading}
        onDownloadSelected={handleDownloadSelectedUsers}
        onDownloadByRange={handleDownloadByRange}
        onDownloadByIdRangeDate={handleDownloadByIdRangeDate}
      />
    </div>
  );
};

export default Laporan;
