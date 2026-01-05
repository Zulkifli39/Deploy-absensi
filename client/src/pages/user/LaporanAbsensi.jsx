import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { IoIosArrowBack, IoIosPrint } from "react-icons/io";
import { PiDotsThreeOutlineVertical } from "react-icons/pi";
import { IoLocationOutline, IoLocationSharp } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";

import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import downloadAttendancePDF from "../../utils/downloadAttendancePdf";

import ModalDetailAbsensi from "../../components/ModalDetailAbsensi";
import { formatDate, formatTime } from "../../utils/Helper";


const getStatusBadge = (item) => {
  if (item.is_late) {
    return { label: "Terlambat", className: "bg-red-100 text-red-600" };
  }
  if (item.is_early_leave) {
    return { label: "Pulang Cepat", className: "bg-yellow-100 text-yellow-600" };
  }
  return { label: "Tepat Waktu", className: "bg-green-100 text-green-600" };
};

const LaporanAbsensi = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

// Modal Absensi
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null)


  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        API_PATHS.ATTENDANCE.GET_HISTORY,
        {
          params: {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
          },
        }
      );

      if (res.data?.success) {
        setAttendances(res.data.data || []);
      }
    } catch (error) {
      toast.error("Gagal ambil absensi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [startDate, endDate]);

  const toggleMenu = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const openModal = (type, attendance) => {
    setModalType(type);
    setSelectedAttendance(attendance);
    setShowModal(true);
    setOpenMenuId(null);
  }

  const fetchAndDownloadPDF = async () => {
    try {
      const res = await axiosInstance.get(
        API_PATHS.ATTENDANCE.GET_HISTORY,
        {
          params: {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            limit: 10000,
          },
        }
      );

      if (res.data?.success) {
        downloadAttendancePDF({
          data: res.data.data,
          startDate: startDate || "-",
          endDate: endDate || "-",
        });
      }
    } catch (error) {
      toast.error("Gagal download PDF:", error);
    }
  };

  return (
    <>
    <div className="p-4 mt-2 bg-secondary">
      <div className="relative flex items-center justify-center mb-6">
        <Link to="/home" className="absolute left-0 w-8 h-8">
          <IoIosArrowBack className="text-2xl" />
        </Link>
        <span className="font-semibold text-[18px]">Laporan Absen</span>
      </div>

      <div className="bg-white p-4 rounded-xl">
        <h1 className="font-semibold text-[14px] text-turqoise mb-1">
          Filter Tanggal
        </h1>
        <p className="text-[12px] text-gray-500 mb-3">
          Pilih rentang tanggal untuk menampilkan riwayat kehadiran
        </p>

        <div className="flex gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
      </div>

      <div className="bg-white mt-4 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-[12px] font-semibold">Absensi Terbaru</h1>

          <button
            onClick={fetchAndDownloadPDF}
            className="flex items-center gap-2 bg-[#f1f7f9] px-3 py-2 rounded-xl"
          >
            <IoIosPrint className="text-[#007c85]" />
            <span className="text-[14px] text-[#007c85] font-bold">
              Export
            </span>
          </button>
        </div>

        <p className="text-[12px] text-gray-500 mb-3">
          Daftar Riwayat Kehadiran
        </p>

        {loading && (
          <p className="text-sm text-gray-400">Memuat data...</p>
        )}

        {!loading && attendances.length === 0 && (
          <p className="text-sm text-gray-400">
            Tidak ada data pada rentang tanggal ini
          </p>
        )}

        {attendances.map((item) => {
          const status = getStatusBadge(item);

          return (
            <div
              key={item.attendance_id}
              className="mt-4 rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-[14px] font-semibold">
                    {formatDate(item.attendance_date)}
                  </h2>
                  <span
                    className={`inline-block mt-1 rounded-full px-3 py-1 text-[10px] font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <button onClick={() => toggleMenu(item.attendance_id)}>
                    <PiDotsThreeOutlineVertical className="text-lg cursor-pointer" />
                  </button>

                  {openMenuId === item.attendance_id && (
                    <div className="mt-2 flex gap-3 text-gray-600">
                        <IoLocationOutline
                        title="Lokasi Check In"
                        className="cursor-pointer text-red-500"
                        onClick={() => openModal("checkin", item)}
                        />

                        <IoLocationSharp
                        title="Lokasi Check Out"
                        className="cursor-pointer text-green-500"
                        onClick={() => openModal("checkout", item)}
                        />

                        <FaRegEye
                        title="Detail Absensi"
                        className="cursor-pointer text-amber-600"
                        onClick={() => openModal("detail", item)}
                        />

                        <FaPenToSquare
                        title="Catatan"
                        className="cursor-pointer"
                        onClick={() => openModal("note", item)}
                        />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-6">
                <div>
                  <p className="text-[12px] text-gray-400">Check In</p>
                  <p className="font-semibold text-emerald-500">
                    {formatTime(item.checkin_time)}
                  </p>
                </div>

                <div>
                  <p className="text-[12px] text-gray-400">Check Out</p>
                  <p className="font-semibold text-yellow-500">
                    {formatTime(item.checkout_time)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    
    {showModal && (
    <ModalDetailAbsensi
        type={modalType}
        data={selectedAttendance}
        onClose={() => setShowModal(false)}
    />
    )}

    </div>
    </>
  );
};

export default LaporanAbsensi;
