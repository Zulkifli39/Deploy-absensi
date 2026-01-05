import React, { useEffect, useState, useContext } from "react";
import { FaCamera } from "react-icons/fa";
import { MdNavigateNext } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

import { MENU_PENGATURAN } from "../../utils/Data";
import { API_PATHS } from "../../utils/ApiPaths";
import axiosInstance from "../../utils/AxiosInstance";
import { UserContext } from "../../context/UserContext";

const Profile = () => {
  const {  clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [profile, setProfile] = useState(null);

  const getProfile = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
      setProfile(res.data.profile);
    } catch (error) {
      console.error("Gagal mengambil profile:", error);
    }
  };

  const handleLogout = () => {
    clearUser();
    navigate("/", { replace: true });
  };

  const handleClick = (route) => {
    if (route === "/logout") {
      handleLogout();
      return;
    }
    navigate(route);
  };

  useEffect(() => {
    getProfile();
  }, []);

 const getAvatarUrl = (path) => {
  if (!path) return "/default-avatar.png"; 
  return `${import.meta.env.VITE_API_URL}${path}`;
};


  return (
    <div className=" bg-secondary">
      <img
        src="/src/assets/Sampul.svg"
        alt="Background"
        className="h-[150px] w-full object-cover"
      />
      <div className="p-2">
        <div className="relative -mt-12 px-6">
          <div className="relative w-fit">
            <img
              src={getAvatarUrl(profile?.avatar)}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-greenbangladesh/20 shadow-md"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-turqoise text-white p-2 rounded-full shadow-md"
            >
              <FaCamera size={14} />
            </button>
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-semibold text-[16px]">
                {profile?.display_name || "-"}
              </h1>

              {profile?.sub_department && (
                <span className="text-[10px] text-blue-600 bg-blue-100 py-1 px-2 rounded-full">
                  {profile.sub_department.sub_department_name}
                </span>
              )}
            </div>

            <span className="text-[14px] text-black block mt-1">
              {profile?.email || "-"}
            </span>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-xl p-5 shadow-sm mx-3 mb-6">
          <div className="mb-4">
            <h1 className="font-semibold text-[16px]">Pengaturan</h1>
            <p className="text-[12px] mt-1 text-gray-600">
              Kelola informasi akun dan preferensi aplikasi anda.
            </p>
          </div>

     <div className="flex flex-col space-y-4">
  {MENU_PENGATURAN.map((item) => {
    const isActive = pathname === item.path;

    return (
      <div
        key={item.id}
        onClick={() => handleClick(item.path)}
        className={`flex items-center justify-between py-4 px-4 rounded-xl shadow-sm cursor-pointer transition
          ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}
        `}
      >
        <div className="flex items-center gap-5">
          <div className={`p-2.5 rounded-lg ${item.bgColor}`}>
            <item.icon size={20} className={item.iconColor} />
          </div>

          <div className="flex flex-col">
            <p className="font-semibold text-[13px]">
              {item.label}
            </p>
            <span className="text-[12px] text-gray-600">
              {item.desc}
            </span>
          </div>
        </div>

        <MdNavigateNext size={22} className="text-gray-400" />
      </div>
    );
  })}
</div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
