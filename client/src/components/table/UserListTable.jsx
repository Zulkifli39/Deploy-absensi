import React, { useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { BiSolidUserDetail } from "react-icons/bi";
import { IoIosCloseCircleOutline } from "react-icons/io";

// Fungsi untuk mendapatkan URL avatar lengkap
const getAvatarUrl = (path) => {
  if (!path) return "/default-avatar.png"; // fallback jika avatar kosong
  return `${import.meta.env.VITE_API_URL}${path}`;
};

const UserListTable = ({ data = [], loading, onEdit, onDelete, onDetail }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAvatar, setModalAvatar] = useState("");
  const [modalName, setModalName] = useState("");

  const openModal = (avatar, name) => {
    setModalAvatar(avatar);
    setModalName(name);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAvatar("");
    setModalName("");
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="px-6 py-3">No</th>
            <th className="px-6 py-3">Nasional ID</th>
            <th className="px-6 py-3">Employee ID</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">No Hp</th>
            <th className="px-6 py-3">Display Name</th>
            <th className="px-6 py-3">Sub Departement</th>
            <th className="px-6 py-3">User Role</th>
            <th className="px-6 py-3">Avatar</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan="10" className="text-center py-6">
                Loading...
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan="10" className="text-center py-6">
                Data tidak tersedia
              </td>
            </tr>
          )}

          {!loading &&
            data.map((user, index) => (
              <tr key={user.user_id} className="border-b text-center">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-medium">{user.national_id_number}</td>
                <td className="px-6 py-4 font-medium">{user.employee_id_number}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.phone_number}</td>
                <td className="px-6 py-4">{user.display_name}</td>
                <td className="px-6 py-4">{user.sub_department_name}</td>
                <td className="px-6 py-4">{user.user_role_name}</td>
                <td className="px-6 py-4">
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                    onClick={() => openModal(user.avatar, user.display_name)}
                  />
                </td>
                <td className="px-6 py-4 flex gap-3 justify-center">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-600 flex items-center gap-2"
                  >
                    <FaRegEdit /> <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="text-red-600 flex items-center gap-2"
                  >
                    <MdDeleteForever /> <span>Delete</span>
                  </button>
                  <button
                    onClick={() => onDetail(user)}
                    className="text-white flex items-center gap-2 bg-turqoise rounded-sm p-2"
                  >
                    <BiSolidUserDetail /> <span>Detail</span>
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Modal Avatar */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
          onClick={closeModal} // klik di overlay menutup modal
        >
          <div
            className="bg-white p-4 rounded-lg shadow-lg relative"
            onClick={(e) => e.stopPropagation()} // mencegah klik di dalam modal menutupnya
          >
            <IoIosCloseCircleOutline
              onClick={closeModal}
              className="absolute text-[30px] top-2 right-2 text-black cursor-pointer"
            />
            <h2 className="text-center font-semibold mb-4">{modalName}</h2>
            <img
              src={getAvatarUrl(modalAvatar)}
              alt={modalName}
              className="max-h-[500px] max-w-[500px] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListTable;