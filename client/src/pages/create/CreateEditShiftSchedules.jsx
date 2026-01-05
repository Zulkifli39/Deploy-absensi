import React, { useEffect, useState } from "react";
import BaseModal from "../../components/BaseModal";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import { ROLES } from "../../constants/roles";

const CreateEditShiftSchedules = ({ open, onClose, onSuccess, selected }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);

  const [form, setForm] = useState({
    period_name: "",
    start_date: "",
    end_date: "",
  });

const isAdmin = user.user_role_id === ROLES.ADMIN || user.user_role_id === ROLES.KEPALA_INSTALASI;
const isLocked = selected?.is_locked;


  useEffect(() => {
    if (selected) {
      setForm({
        period_name: selected.period_name ?? "",
        start_date: selected.start_date ? selected.start_date.slice(0, 10) : "",
        end_date: selected.end_date ? selected.end_date.slice(0, 10) : "",
      });
    } else {
      setForm({
        period_name: "",
        start_date: "",
        end_date: "",
      });
    }
  }, [selected, open]);

  const handleSubmit = async () => {
    if (!isAdmin) {
      toast.error("Anda tidak memiliki akses untuk menambah atau mengedit period");
      return;
    }

    try {
      setLoading(true);

      if (selected) {
        await axiosInstance.put(
          API_PATHS.SCHEDULE_PERIODS.UPDATE.replace(":id", selected.period_id),
          form
        );
        toast.success("Schedule period berhasil diperbarui");
      } else {
        await axiosInstance.post(API_PATHS.SCHEDULE_PERIODS.CREATE, form);
        toast.success("Schedule period berhasil ditambahkan");
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async () => {
    if (!isAdmin) {
      toast.error("Anda tidak memiliki akses untuk mengunci period");
      return;
    }

    try {
      setLockLoading(true);

      await axiosInstance.put(
        API_PATHS.SCHEDULE_PERIODS.LOCK.replace(":id", selected.period_id)
      );

      toast.success("Periode berhasil dikunci");

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal mengunci periode");
    } finally {
      setLockLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={selected ? "Edit Schedule Period" : "Tambah Schedule Period"}
      footer={
        <div className="flex justify-between gap-2">
          {/* LOCK BUTTON (HANYA ADMIN & BELUM LOCK) */}
          {isAdmin && selected && !isLocked && (
            <button
              onClick={handleLock}
              disabled={lockLoading}
              className="px-4 py-2 rounded bg-red-600 text-white"
            >
              {lockLoading ? "Mengunci..." : "Lock Period"}
            </button>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="border px-4 py-2 rounded">
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || isLocked || !isAdmin}
              className="bg-turqoise text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Period Name</label>
          <input
            disabled={isLocked || !isAdmin}
            className="w-full border p-2 rounded disabled:bg-gray-100"
            value={form.period_name}
            onChange={(e) => setForm({ ...form, period_name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Start Date</label>
          <input
            type="date"
            disabled={isLocked || !isAdmin}
            className="w-full border p-2 rounded disabled:bg-gray-100"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">End Date</label>
          <input
            type="date"
            disabled={isLocked || !isAdmin}
            className="w-full border p-2 rounded disabled:bg-gray-100"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>

        {/* STATUS */}
        {selected && (
          <div className="text-sm">
            Status:{" "}
            <span className={`font-semibold ${isLocked ? "text-red-600" : "text-green-600"}`}>
              {isLocked ? "Locked" : "Unlocked"}
            </span>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default CreateEditShiftSchedules;
