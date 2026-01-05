import React from "react";
import { MdDeleteForever } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { ROLES } from "../../constants/roles";
import { useUser } from "../../context/UserContext";

const formatDbDateTime = (value) => {
  if (!value) return "-";
  if (value.includes("T")) {
    return value.replace("T", " ").split(".")[0];
  }
  return value;
};

const RoleListTable = ({ data = [], loading, onEdit, onDelete }) => {
  const { user } = useUser();
  const isAdmin = user?.user_role_id === ROLES.ADMIN;

  const colSpan = isAdmin ? 6 : 5;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="px-6 py-3">No</th>
            <th className="px-6 py-3">Role Name</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Created At</th>
            <th className="px-6 py-3">Updated At</th>
            {isAdmin && <th className="px-6 py-3">Action</th>}
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={colSpan} className="text-center py-6">
                Loading...
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="text-center py-6">
                Data tidak tersedia
              </td>
            </tr>
          )}

          {!loading &&
            data.map((role, index) => (
              <tr
                key={role.user_role_id}
                className="border-b text-center"
              >
                <td className="px-6 py-4">{index + 1}</td>

                <td className="px-6 py-4 font-medium">
                  {role.user_role_name}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      role.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {role.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {formatDbDateTime(role.created_at)}
                </td>

                <td className="px-6 py-4">
                  {formatDbDateTime(role.updated_at)}
                </td>

                {isAdmin && (
                  <td className="px-6 py-4 flex gap-3 justify-center">
                    <button
                      onClick={() => onEdit(role)}
                      className="text-blue-600 flex items-center gap-1"
                    >
                      <FaRegEdit /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(role)}
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

export default RoleListTable;
