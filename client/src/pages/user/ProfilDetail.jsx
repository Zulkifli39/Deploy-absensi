import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { API_PATHS } from "../../utils/ApiPaths";
import axiosInstance from "../../utils/AxiosInstance";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ProfilDetail = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
      setProfile(res.data.profile);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;

    setForm({
      full_name: profile.user_details?.full_name || "",
      birth_date: profile.user_details?.birth_date
        ? profile.user_details.birth_date.split("T")[0]
        : "",
      gender: profile.user_details?.gender || "",
      phone_number: profile.phone_number || "",
      address: profile.user_details?.address || "",
    });
  }, [profile]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axiosInstance.put(API_PATHS.AUTH.UPDATE, {
        full_name: form.full_name,
        birth_date: form.birth_date,
        gender: form.gender,
        phone_number: form.phone_number,
        address: form.address,
      });

      toast.success("Profil berhasil diperbarui");
      setIsEdit(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEdit(false);
    setForm({
      full_name: profile.user_details?.full_name || "",
      birth_date: profile.user_details?.birth_date
        ? profile.user_details.birth_date.split("T")[0]
        : "",
      gender: profile.user_details?.gender || "",
      phone_number: profile.phone_number || "",
      address: profile.user_details?.address || "",
    });
  };

  if (loading) {
    return (
      <div className="p-4 bg-secondary  text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!profile) return null;

  const inputClass = (editable) =>
    `w-full border rounded-xl px-3 py-2 text-[12px] ${
      editable ? "bg-white" : "bg-gray-100"
    }`;

  return (
    <div className="p-4 mt-2 bg-secondary ">
      {/* Header */}
      <div className="flex items-center gap-24">
        <Link to="/profile">
        <IoIosArrowBack className="text-2xl cursor-pointer" />
        </Link>
        <span className="font-semibold text-[18px]">Detail Profil</span>
      </div>

      {/* Info */}
      <div className="bg-white mt-6 p-4 rounded-xl">
        <h1 className="font-semibold text-[14px] text-turqoise">
          Informasi Pribadi Anda
        </h1>
        <p className="text-[12px] text-gray-500">
          Silakan atur informasi pribadi Anda
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow-md p-4 rounded-xl mt-4 space-y-4">
        {/* NIP */}
        <Field label="NIP">
          <input
            readOnly
            value={profile.employee_id_number || ""}
            className={inputClass(false)}
          />
        </Field>

        {/* Nama */}
        <Field label="Nama Lengkap">
          <input
            value={form.full_name}
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
            readOnly={!isEdit}
            className={inputClass(isEdit)}
          />
        </Field>

        {/* Tanggal Lahir */}
        <Field label="Tanggal Lahir">
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) =>
              setForm({ ...form, birth_date: e.target.value })
            }
            readOnly={!isEdit}
            className={inputClass(isEdit)}
          />
        </Field>

        {/* Gender */}
        <Field label="Jenis Kelamin">
          <input
            value={form.gender}
            onChange={(e) =>
              setForm({ ...form, gender: e.target.value })
            }
            readOnly={!isEdit}
            className={inputClass(isEdit)}
          />
        </Field>

        {/* Posisi */}
        <Field label="Posisi">
          <input
            readOnly
            value={profile.sub_department?.sub_department_name || "-"}
            className={inputClass(false)}
          />
        </Field>

        {/* Email */}
        <Field label="Email">
          <input
            readOnly
            value={profile.email || ""}
            className={inputClass(false)}
          />
        </Field>

        {/* Phone */}
        <Field label="Nomor HP">
          <input
            value={form.phone_number}
            onChange={(e) =>
              setForm({ ...form, phone_number: e.target.value })
            }
            readOnly={!isEdit}
            className={inputClass(isEdit)}
          />
        </Field>

        {/* Address */}
        <Field label="Alamat">
          <input
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            readOnly={!isEdit}
            className={inputClass(isEdit)}
          />
        </Field>

        {/* Action */}
        {!isEdit ? (
          <button
            onClick={() => setIsEdit(true)}
            className="bg-turqoise w-full text-white py-2 rounded-xl"
          >
            Edit Profil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="bg-turqoise w-full text-white py-2 rounded-xl"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              onClick={cancelEdit}
              className="border w-full py-2 rounded-xl"
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block font-semibold text-[12px] mb-1">{label}</label>
    {children}
  </div>
);

export default ProfilDetail;
