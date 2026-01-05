import React from "react";
import { MdDeleteForever } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";

const formatDbDate = (value) => {
  if (!value) return "-";
  if (value.includes("T")) return value.split("T")[0];
  if (value.includes(" ")) return value.split(" ")[0];
  return value;
};

const SchedulePeriodsTable = ({ data = [], loading, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="px-6 py-3">No</th>
            <th className="px-6 py-3">Nama Periode</th>
            <th className="px-6 py-3">Tanggal Mulai</th>
            <th className="px-6 py-3">Tanggal Selesai</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan="7" className="text-center py-6">
                Loading...
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center py-6">
                Data tidak tersedia
              </td>
            </tr>
          )}

          {!loading &&
            data.map((dept, index) => (
              <tr key={dept.period_id} className="border-b text-center">
                <td className="px-6 py-4">{index + 1}</td>

                <td className="px-6 py-4 font-medium">
                  {dept.period_name}
                </td>

                <td className="px-6 py-4">
                  {formatDbDate(dept.start_date)}
                </td>

                <td className="px-6 py-4">
                  {formatDbDate(dept.end_date)}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      dept.is_locked
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {dept.is_locked ? "Locked" : "Unlocked"}
                  </span>
                </td>

                <td className="px-6 py-4 flex gap-3 justify-center">
                  <button
                    onClick={() => onEdit(dept)}
                    className="text-blue-600 flex items-center gap-2"
                  >
                    <FaRegEdit /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(dept)}
                    className="text-red-600 flex items-center gap-2"
                  >
                    <MdDeleteForever /> Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default SchedulePeriodsTable;
