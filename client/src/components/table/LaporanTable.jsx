import React, { useMemo, useState } from "react";

/* =====================
   FORMAT HELPERS
===================== */
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID");
};

const formatTime = (time) => {
  if (!time) return "-";
  return new Date(time).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const LaporanTable = ({
  data = [],
  shifts = [],
  users = [],
  periods = [],
  loading = false,
  onDownloadSelected,
  onDownloadByIdRangeDate
}) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    data.length > 0 && selectedIds.length === data.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : data.map((d) => d.attendance_id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* =====================
     MAP DATA
  ===================== */
  const shiftMap = useMemo(() => {
    const map = {};
    shifts.forEach((s) => (map[s.shift_id] = s));
    return map;
  }, [shifts]);

  const userMap = useMemo(() => {
    const map = {};
    users.forEach((u) => (map[u.user_id] = u));
    return map;
  }, [users]);

  const periodMap = useMemo(() => {
    const map = {};
    periods.forEach((p) => (map[p.period_id] = p));
    return map;
  }, [periods]);

  /* =====================
     LOADING
  ===================== */
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Memuat data laporan...
      </div>
    );
  }

  /* =====================
     SELECTED USERS (UNIQUE)
  ===================== */
  const selectedUserIds = [
    ...new Set(
      data
        .filter((d) => selectedIds.includes(d.attendance_id))
        .map((d) => d.user_id)
    ),
  ];

  return (
    <div className="overflow-x-auto border rounded-xl shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 w-10 text-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4"
              />
            </th>
            <th className="px-3 py-2 w-12">No</th>
            <th className="px-3 py-2 text-left min-w-[220px]">
              Nama Pegawai
            </th>
            <th className="px-3 py-2 text-center">Shift</th>
            <th className="px-3 py-2 text-center">Periode</th>
            <th className="px-3 py-2 text-center">Tanggal</th>
            <th className="px-3 py-2 text-center">Jam Masuk</th>
            <th className="px-3 py-2 text-center">Jam Keluar</th>
            <th className="px-3 py-2 text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-6 text-center text-gray-500">
                Tidak ada data absensi
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const user = userMap[row.user_id];
              const shift = shiftMap[row.shift_id];
              const period = periodMap[row.period_id];
              const isChecked = selectedIds.includes(row.attendance_id);

              return (
                <tr
                  key={row.attendance_id}
                  className={`hover:bg-gray-50 ${
                    isChecked ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelectRow(row.attendance_id)}
                      className="w-4 h-4"
                    />
                  </td>

                  <td className="px-3 py-2 text-center">{index + 1}</td>

                  <td className="px-3 py-2">
                    <div className="font-semibold text-gray-800">
                      {user?.display_name || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.department_name} •{" "}
                      {user?.sub_department_name}
                    </div>
                  </td>

                  <td className="px-3 py-2 text-center">
                    {shift?.shift_name || "-"}
                  </td>

                  <td className="px-3 py-2 text-center">
                    {period?.period_name || "-"}
                  </td>

                  <td className="px-3 py-2 text-center">
                    {formatDate(row.attendance_date)}
                  </td>

                  <td className="px-3 py-2 text-center">
                    {formatTime(row.checkin_time)}
                  </td>

                  <td className="px-3 py-2 text-center">
                    {formatTime(row.checkout_time)}
                  </td>

                  <td className="px-3 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        row.attendance_status === "HADIR"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.attendance_status}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* =====================
          ACTION BAR
      ===================== */}
      {selectedIds.length > 0 && (
        <div className="px-4 py-3 border-t flex flex-wrap gap-2 justify-between items-center text-sm">
          <span className="text-gray-600">
            {selectedIds.length} data dipilih
          </span>

          <div className="flex gap-2">
            {/* DOWNLOAD PERIODE */}
            <button
              onClick={() =>
                selectedUserIds.forEach((id) =>
                  onDownloadSelected?.(id)
                )
              }
              className="px-3 py-1 rounded-md bg-green-600 text-white text-xs hover:bg-green-700"
            >
              Download Periode
            </button>

             <button
                onClick={() =>
                  selectedUserIds.forEach((userId) =>
                    onDownloadByIdRangeDate?.(userId)
                  )
                }
                className="px-3 py-1 rounded-md bg-purple-600 text-white text-xs"
              >
                Download User (Range)
              </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LaporanTable;
