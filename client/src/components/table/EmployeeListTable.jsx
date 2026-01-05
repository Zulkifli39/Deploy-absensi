import React from 'react';
import { MdDeleteForever } from 'react-icons/md';
import { FaRegEdit } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { ROLES } from '../../constants/roles';

const EmployeeListTable = ({ data = [], loading, onEdit, onDelete }) => {
  const { user } = useUser(); // <-- destructuring user

  const isAdmin = user?.user_role_id === ROLES.ADMIN;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="px-6 py-3">No</th>
            <th className="px-6 py-3">Status Name</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Active</th>
            {isAdmin && <th className="px-6 py-3">Action</th>}
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={isAdmin ? 5 : 4} className="text-center py-6">
                Loading...
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 5 : 4} className="text-center py-6">
                Data tidak tersedia
              </td>
            </tr>
          )}

          {!loading &&
            data.map((employee, index) => (
              <tr key={employee.employee_status_id} className="border-b text-center">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-medium">{employee.status_name}</td>
                <td className="px-6 py-4 font-medium">{employee.description}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      employee.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 flex gap-3 justify-center">
                    <button
                      onClick={() => onEdit(employee)}
                      className="text-blue-600 flex items-center gap-2"
                    >
                      <FaRegEdit /> <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(employee)}
                      className="text-red-600 flex items-center gap-2"
                    >
                      <MdDeleteForever /> <span>Delete</span>
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

export default EmployeeListTable;
