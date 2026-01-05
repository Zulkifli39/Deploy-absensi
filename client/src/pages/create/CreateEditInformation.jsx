import React, { useEffect, useState, useRef } from 'react';
import { API_PATHS } from '../../utils/ApiPaths';
import axiosInstance from '../../utils/AxiosInstance';
import { toast } from 'react-toastify';
import BaseModal from '../../components/BaseModal';

const CreateEditInformation = ({ open, onClose, onSuccess, selected }) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    pdf: null,
    image: null,
  });

  const [pdfName, setPdfName] = useState('');
  const [imageName, setImageName] = useState('');

  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (selected) {
      setForm({
        title: selected.title || '',
        description: selected.description || '',
        pdf: null,
        image: null,
      });

      setPdfName(
        selected.pdf_file_url
          ? selected.pdf_file_url.split('/').pop()
          : ''
      );

      setImageName(
        selected.image
          ? selected.image.split('/').pop()
          : ''
      );
    } else {
      setForm({
        title: '',
        description: '',
        pdf: null,
        image: null,
      });
      setPdfName('');
      setImageName('');
    }
  }, [selected, open]);

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      pdf: file,
    }));

    setPdfName(file.name);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    setImageName(file.name);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    if (!selected && !form.pdf) {
      toast.error('File PDF wajib diupload');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);

      if (form.pdf) formData.append('pdf', form.pdf);
      if (form.image) formData.append('image', form.image);

      if (selected) {
        await axiosInstance.put(
          API_PATHS.INFORMATION.UPDATE.replace(
            ':id',
            selected.information_id
          ),
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success('Informasi berhasil diperbarui');
      } else {
        await axiosInstance.post(
          API_PATHS.INFORMATION.CREATE,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success('Informasi berhasil ditambahkan');
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={selected ? 'Edit Informasi' : 'Tambah Informasi'}
      footer={
        <>
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-turqoise text-white px-4 py-2 rounded"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Judul</label>
          <input
            className="w-full border p-2 rounded"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Deskripsi</label>
          <textarea
            rows="4"
            className="w-full border p-2 rounded"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Upload File PDF
          </label>
          <div
            className="w-full border p-2 rounded cursor-pointer"
            onClick={() => pdfInputRef.current.click()}
          >
            {pdfName || 'Klik untuk pilih file PDF'}
          </div>
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={handlePdfChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Upload Gambar
          </label>
          <div
            className="w-full border p-2 rounded cursor-pointer"
            onClick={() => imageInputRef.current.click()}
          >
            {imageName || 'Klik untuk pilih gambar'}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default CreateEditInformation;
