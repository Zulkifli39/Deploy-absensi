import React, { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { API_PATHS } from "../../utils/ApiPaths";
import axiosInstance from "../../utils/AxiosInstance";

const Informasi = () => {
  const [informasi, setInformasi] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */

  const getInformasi = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.INFORMATION.GET_ALL);
      setInformasi(res.data?.data || []);
    } catch (error) {
      console.error("Gagal fetch informasi:", error);
      setInformasi([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInformasi();
  }, []); // ✅ WAJIB ada []

  /* ================= HELPERS ================= */

  const formatTanggal = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getPdfUrl = (path) => {
  if (!path) return "#";
  return `${import.meta.env.VITE_API_URL}${path}`;
};
  /* ================= RENDER ================= */

  return (
    <div className="p-4 mt-2 bg-secondary">
      {/* Header */}
      <div className="flex items-center gap-28">
        <IoIosArrowBack className="text-2xl cursor-pointer" />
        <span className="font-semibold text-[18px]">Info OSDM</span>
      </div>

      <div className="mt-8 p-4 bg-white rounded-xl shadow-md">
        {/* Loading */}
        {loading && (
          <div className="text-center py-6 text-gray-500">
            Loading...
          </div>
        )}

        {/* Empty */}
        {!loading && informasi.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            Data tidak tersedia
          </div>
        )}

        {/* Data */}
        {!loading &&
        informasi.map((item) => (
            <a
            key={item.information_id}
            href={getPdfUrl(item.pdf_file_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center  gap-6 space-y-2 p-2 rounded-lg transition "
            >
            <img
                src="/src/assets/fitur/pdf.svg"
                alt="PDF"
                className="w-[29px] h-[35px]"
          />
      <div className="flex flex-col">
        <span className="font-semibold text-sm">
          {item.title}
        </span>

        <span className="text-[12px] text-gray-400">
          {formatTanggal(item.created_at)}
        </span>
      </div>
    </a>
  ))}

      </div>
    </div>
  );
};

export default Informasi;
