import React from "react";
import { MdDeleteForever } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";

const ShiftTable = ({ data = [], loading, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-center">
        <thead className="border-b bg-gray-100">
          <tr>
            <th className="px-6 py-3">No</th>
            <th className="px-6 py-3">Shift Code</th>
            <th className="px-6 py-3">Shift Name</th>
            <th className="px-6 py-3">Shift Type</th>
            <th className="px-6 py-3">CheckIn Time</th>
            <th className="px-6 py-3">CheckOut Time</th>
            <th className="px-6 py-3">Is Next Day</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan="9" className="text-center py-6">
                Loading...
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan="9" className="text-center py-6">
                Data tidak tersedia
              </td>
            </tr>
          )}

          {!loading &&
            data.map((shift, index) => (
              <tr key={shift.shift_id} className="border-b">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-medium">{shift.shift_code}</td>
                <td className="px-6 py-4 font-medium">{shift.shift_name}</td>
                <td className="px-6 py-4 font-medium">{shift.shift_type}</td>
                <td className="px-6 py-4 font-medium">{shift.checkin_time}</td>
                <td className="px-6 py-4 font-medium">{shift.checkout_time}</td>
                <td className="px-6 py-4 font-medium">
                  {shift.is_next_day ? "Ya" : "Tidak"}
                </td>
                <td className="px-6 py-4 flex gap-3 justify-center">
                  <button
                    onClick={() => onEdit(shift)}
                    className="text-blue-600 flex items-center gap-1"
                  >
                    <FaRegEdit /> <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(shift)}
                    className="text-red-600 flex items-center gap-1"
                  >
                    <MdDeleteForever /> <span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShiftTable;
