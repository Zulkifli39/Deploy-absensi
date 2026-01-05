import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { Link } from "react-router-dom";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (item) => {
  if (item.is_late) {
    return {
      label: "Terlambat",
      className: "bg-red-100 text-red-600",
    };
  }

  if (item.is_early_leave) {
    return {
      label: "Pulang Cepat",
      className: "bg-yellow-100 text-yellow-600",
    };
  }

  return {
    label: "Tepat Waktu",
    className: "bg-green-100 text-green-600",
  };
};

const AbsensiNew = () => {
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        API_PATHS.ATTENDANCE.GET_HISTORY // /api/attendance/history
      );

      if (res.data?.success) {
        // ambil 2 data terbaru
        setAttendances(res.data.data.slice(0, 2));
      }
    } catch (error) {
      console.error("Gagal ambil absensi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-400">
        Memuat absensi...
      </div>
    );
  }

  if (attendances.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-400">
        Belum ada data absensi
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[14px] font-semibold">Absensi Terbaru</h1>
        <Link to="/laporan-absensi">
          <span className="text-[12px] font-semibold text-[#1AA6E5] cursor-pointer">
            Lihat semua
          </span>
        </Link>
      </div>

      {/* Cards */}
      {attendances.map((item) => {
        const status = getStatusBadge(item);

        return (
          <div
            key={item.attendance_id}
            className="mt-4 rounded-2xl bg-white p-5 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-gray-800">
                {formatDate(item.attendance_date)}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            {/* Content */}
            <div className="mt-4 flex gap-4">
              {/* Check In */}
              <div>
                <p className="text-[12px] text-gray-400">Check In</p>
                <p className="mt-1 text-[14px] font-semibold text-emerald-500">
                  {formatTime(item.checkin_time)}
                </p>
              </div>

              {/* Check Out */}
              <div >
                <p className="text-[12px] text-gray-400">Check Out</p>
                <p className="mt-1 text-[14px] font-semibold text-yellow-500">
                  {formatTime(item.checkout_time)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AbsensiNew;
