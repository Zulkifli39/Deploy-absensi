import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { Link, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    token: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.token || !form.newPassword || !form.confirmPassword) {
      return toast.error("Semua field wajib diisi");
    }

    if (form.newPassword.length < 6) {
      return toast.error("Password minimal 6 karakter");
    }

    if (form.newPassword !== form.confirmPassword) {  
      return toast.error("Password tidak sama");
    }

    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, {
        token: form.token,
        newPassword: form.newPassword,
      });

      toast.success("Password berhasil diubah");
      navigate("/keamanan");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-secondary ">
      <div className="flex items-center gap-20">
        <Link to="/profile">
          <IoIosArrowBack className="text-2xl" />
        </Link>
        <span className="font-semibold text-[18px]">Reset Password</span>
      </div>

      <div className="bg-white mt-6 p-4 rounded-xl">
        <h1 className="font-semibold text-[14px] text-turqoise">
          Reset Password
        </h1>
        <p className="text-[12px] text-gray-500">
          Masukkan token dan password baru
        </p>
      </div>

      <div className="bg-white mt-4 p-4 rounded-xl shadow space-y-4">
        <Input
          label="Token"
          placeholder="Masukkan token dari email"
          value={form.token}
          onChange={(e) =>
            setForm({ ...form, token: e.target.value })
          }
        />

        <Input
          label="Password Baru"
          type="password"
          placeholder="Password baru"
          value={form.newPassword}
          onChange={(e) =>
            setForm({ ...form, newPassword: e.target.value })
          }
        />

        <Input
          label="Konfirmasi Password"
          type="password"
          placeholder="Ulangi password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />
        <button>
          <Link to="/reset-password">
            <p className="text-[12px] text-turqoise">Lupa password?</p>
          </Link>
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-turqoise text-white w-full py-2 rounded-xl"
        >
          {loading ? "Menyimpan..." : "Reset Password"  }
        </button>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[12px] font-semibold">{label}</label>
    <input
      {...props}
      className="border border-gray-300 rounded-xl p-2 text-[12px]"
    />
  </div>
);

export default ResetPassword;
