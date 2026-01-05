// src/components/SideMenu.jsx
import React, { useContext, useEffect, useState } from "react";
import { MdMenuOpen } from "react-icons/md";
import { HiOutlineLogout } from "react-icons/hi";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { SIDE_MENU, SIDE_MENU_DASHBOARD } from "../../utils/Data";
import { IoIosArrowForward } from "react-icons/io";

const SideMenu = ({
  user,
  activeMenu,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const open = !isCollapsed;
  
  const [openSubMenu, setOpenSubMenu] = useState(null);

  useEffect(() => {
    setMenuItems(user?.role === "admin" ? SIDE_MENU : SIDE_MENU_DASHBOARD);
  }, [user]);
  
  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  return (
    <nav
      className={`
        fixed inset-y-0 left-0 z-50 h-screen shadow-md bg-[#f7f7f7] text-black
        duration-500 flex flex-col p-2
        ${open ? "w-60" : "w-16"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Collapse Button */}
      <div className="flex justify-end px-2 pt-3">
        <IoIosArrowForward
          size={20}
          className={`cursor-pointer transition-all bg-turqoise rounded-full text-white ${
            !open && "rotate-180"
          }`}
          onClick={onToggleCollapse}
        />
      </div>

      {/* Profile Header */}
      <div
        className={`
          flex flex-col items-center text-center border-b border-white/20 pb-6   
          transition-all duration-500 
          ${open ? "opacity-100" : "opacity-0 pointer-events-none h-0"}
        `}
      >
        <div className="relative">
          <img
            src={
              user?.avatar
                ? `${import.meta.env.VITE_API_URL}${user.avatar}`
                : "https://via.placeholder.com/80"
            }
            className="w-20 h-20 rounded-full shadow-md border-2 border-white/40 object-cover"
          />

          {user?.role === "admin" && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-turqoise text-black text-[10px] px-3 py-0.5 rounded-full shadow">
              Admin
            </span>
          )}
        </div>

        <h5 className="text-turqoise font-semibold mt-4 text-[15px]">
          {user?.display_name || "User"}
        </h5>
        <p className="text-turqoise text-[13px]">{user?.email || "No email"}</p>
      </div>

      {/* Menu List */}
      <ul className="flex-1 space-y-1 mt-2">
        {menuItems.map((item) => {
          const isActive = activeMenu === item.label;
          const hasSubMenu = item.subMenu && item.subMenu.length > 0;

          return (
            <li key={item.id} className="flex flex-col">
              <div
                onClick={() => {
                  if (hasSubMenu) {
                    setOpenSubMenu(openSubMenu === item.id ? null : item.id);
                  } else {
                    navigate(item.path);
                    onCloseMobile?.();
                  }
                }}
                className={`flex items-center gap-3 cursor-pointer select-none px-3 py-3 rounded-lg transition-all duration-300
                  ${isActive ? "bg-turqoise/20 text-greenbangladesh border-l-4 border-turqoise" : "text-gray-700 hover:bg-turqoise hover:bg-opacity-20 hover:text-greenbangladesh"}`}
              >
                <item.icon size={22} className={`${isActive ? "text-greenbangladesh" : "text-gray-600"}`} />
                <span className={`${open ? "opacity-100" : "opacity-0 w-0 overflow-hidden absolute"} font-medium tracking-wide text-sm transition-all duration-300`}>
                  {item.label}
                </span>
                {hasSubMenu && open && (
                  <span className="ml-auto">{openSubMenu === item.id ? "▾" : "▸"}</span>
                )}
              </div>

              {/* Render SubMenu */}
              {hasSubMenu && openSubMenu === item.id && (
                <ul className="pl-8 mt-1 space-y-1 ">
                  {item.subMenu.map((sub) => (
                    <li
                      key={sub.id}
                      onClick={() => {
                        navigate(sub.path);
                        onCloseMobile?.();
                      }}
                      className="flex items-center gap-4 cursor-pointer px-3 py-2 rounded-lg text-gray-700 hover:bg-turqoise hover:bg-opacity-20 hover:text-greenbangladesh"
                    >
                      {/* Tampilkan ikon SubMenu */}
                      {sub.icon && <sub.icon size={18} className="text-gray-600" />}
                      <span className={`${open ? "opacity-100" : "opacity-0 w-0 overflow-hidden absolute"} transition-all duration-300 text-[16px] font-reguler`}>
                        {sub.label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {/* Logout */}
      <div className="border- border-white/20 mt-3 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md w-full bg-red-600 transition cursor-pointer"
        >
          <HiOutlineLogout size={22} className="text-white" />
          <span
            className={`
              transition-all text-white duration-300 font-semibold
              ${open ? "opacity-100" : "opacity-0 w-0 overflow-hidden absolute"}
            `}
          >
            Keluar
          </span>
        </button>
      </div>
    </nav>
  );
};

export default SideMenu;
