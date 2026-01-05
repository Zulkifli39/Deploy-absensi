import React from 'react'
import { FaRegEdit } from 'react-icons/fa'
import { MdDeleteForever } from 'react-icons/md'

const InformationListTable = ({data = [], loading, onEdit, onDelete}) => {

  // Fungsi untuk mendapatkan URL avatar lengkap
const getAvatarUrl = (path) => {
  if (!path) return "/default-avatar.png"; // fallback jika avatar kosong
  return `${import.meta.env.VITE_API_URL}${path}`;
};

const getPdfUrl = (path) => {
  if (!path) return "#";
  return `${import.meta.env.VITE_API_URL}${path}`;
};
  return (
    <div className='overflow-x-auto'>
            <table className="min-w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="px-6 py-3">No</th>
                      <th className="px-6 py-3">Title</th>
                      <th className="px-6 py-3">Deskripsi</th>
                      <th className="px-6 py-3">Pdf File</th>
                      <th className="px-6 py-3">Gambar</th>
                      <th className="px-6 py-3">Aksi</th>
                    </tr>
                  </thead>
          
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan="4" className="text-center py-6">
                          
                          Loading...
                        </td>
                      </tr>
                    )}
                    {!loading && data.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-6">
                          Data tidak tersedia
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      data.map((information, index) => (
                        <tr key={information.title} className="border-b text-center">
                          <td className="px-6 py-4">{index + 1}</td>
                          <td className="px-6 py-4 font-medium">
                            {information.title}
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {information.description}
                          </td>
                          <td className="px-4 py-3 text-center">
                              {information.pdf_file_url ? (
                                <a
                                  href={getPdfUrl(information.pdf_file_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 text-blue-600 hover:underline"
                                >
                                  <img
                                    src="/src/assets/fitur/pdf.svg"
                                    alt="pdf"
                                    className="w-6 h-6"
                                  />
                                  <span>PDF</span>
                                </a>
                              ) : (
                                '-'
                              )}
                          </td>
                            <td className="px-6 py-4 font-medium">
                            <div className="flex justify-center">
                              <img
                                src={getAvatarUrl(information.image)}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                              />
                            </div>
                          </td>

                          <td className="px-6 py-4  items-center  gap-3 text-center ">
                            <div className='flex justify-center'>
                            <button onClick={() => onEdit(information)} className="text-blue-600 flex  items-center gap-2">
                              <FaRegEdit /> <span>Edit</span>
                            </button>
                            <button onClick={() => onDelete(information)} className="text-red-600 flex items-center gap-2">
                              <MdDeleteForever /> <span>Delete</span>
                            </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
    </div>
  )
}
export default InformationListTable
