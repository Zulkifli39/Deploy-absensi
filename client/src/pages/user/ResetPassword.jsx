import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Email wajib diisi");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email });
      toast.success("Token reset dikirim ke email");
      navigate("/reset-password");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-secondary min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-20 mb-4">
        <IoIosArrowBack
          className="text-2xl cursor-pointer"
          onClick={() => navigate("/keamanan")}
        />
        <h1 className="font-semibold text-[18px]">Reset Password</h1>
      </div>

      {/* Info */}
      <div className="bg-white p-4 rounded-xl">
        <h2 className="font-semibold text-[14px] text-turqoise">
          Reset Password
        </h2>
        <p className="text-[12px] text-gray-500">
          Masukkan email untuk mendapatkan token reset password
        </p>
      </div>

      {/* Form */}
      <div className="bg-white mt-4 p-4 rounded-xl shadow space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-semibold">Email</label>
          <input
            type="email"
            placeholder="Masukkan email"
            className="border rounded-xl p-2 text-[12px]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-turqoise text-white w-full py-2 rounded-xl"
        >
          {loading ? "Mengirim..." : "Kirim Token"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
