import React from "react";
import { MdDeleteForever } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { useUser } from "../../context/UserContext";
import { ROLES } from "../../constants/roles";

const TaskListTable = ({ data = [], loading, onEdit, onDelete }) => {
  const { user } = useUser();
  
  // ✅ CEK ADMIN BERDASARKAN ROLE ID
  const isAdmin = user?.user_role_id === ROLES.ADMIN;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="px-6 py-3">No</th>
            <th className="px-6 py-3">Nama Departement</th>
            <th className="px-6 py-3">Aksi</th>

            {isAdmin && <th className="px-6 py-3">Action</th>}
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={isAdmin ? 4 : 3}
                className="text-center py-6"
              >
                Loading...
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td
                colSpan={isAdmin ? 4 : 3}
                className="text-center py-6"
              >
                Data tidak tersedia
              </td>
            </tr>
          )}

          {!loading &&
            data.map((dept, index) => (
              <tr
                key={dept.department_id}
                className="border-b text-center"
              >
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-medium">
                  {dept.department_name}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      dept.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {dept.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* 🔐 Action hanya Admin */}
                {isAdmin && (
                  <td className="px-6 py-4 flex gap-3 justify-center">
                    <button
                      onClick={() => onEdit(dept)}
                      className="text-blue-600 flex items-center gap-1"
                    >
                      <FaRegEdit /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(dept)}
                      className="text-red-600 flex items-center gap-1"
                    >
                      <MdDeleteForever /> Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListTable;
