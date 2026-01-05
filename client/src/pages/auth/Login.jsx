import React, { useState, useContext } from "react";
import Input from "../../components/inputs/Input";
import { validateEmail } from "../../utils/Validate";
import axiosInstance from "../../utils/AxiosInstance";
import { API_PATHS } from "../../utils/ApiPaths";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { saveUser } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Email tidak valid.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      saveUser(res.data);

      navigate(res.data.redirect_to || "/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
        "Login gagal. Periksa email dan password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen  bg-cover bg-center"
      style={{ backgroundImage: "url('/src/assets/LoginBg.jpg')" }}
    >
      <div className="absolute inset-0 bg-turqoise/60" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex justify-center pt-8">
          <img
            src="/src/assets/LogoRsup.svg"
            alt="Logo RSUP"
            className="w-[120px] h-[120px]"
          />
        </div>

        <form
          onSubmit={handleLogin}
          className="mt-auto bg-white rounded-t-3xl shadow-xl p-6"
        >
          <h1 className="font-bold text-xl mb-1">Login</h1>
          <p className="text-sm mb-4">
            Selamat Datang di{" "}
            <span className="text-turqoise font-semibold">
              RSUP Makassar
            </span>
          </p>

          <div className="space-y-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              type="email"
              placeholder="john@placeholder.com"
            />

            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              type="password"
              placeholder="********"
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-turqoise text-white py-2 rounded-xl font-bold
              hover:bg-turqoise/90 transition disabled:bg-gray-400"
            >
              {loading ? "Loading..." : "Masuk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
