// src/components/Navbar.jsx
import React from "react";
import { HiMenu, HiX } from "react-icons/hi";
import NavbarBg from "../../assets/LogoRsup.svg";

const Navbar = ({ activeMenu, isMobileOpen, onToggleMobile }) => {
  return (
    <header className="bg-white border-b border-gray-200/50 backdrop-blur-[2px] px-2 sticky top-0 z-30">
      <div className="flex items-center justify-between px-2 py-4">

        {/* Hamburger Mobile */}
        <button
          onClick={onToggleMobile}
          className="lg:hidden text-gray-700 hover:bg-emerald-700/10 p-2 rounded-md transition"
        >
          {isMobileOpen ? <HiX size={28} /> : <HiMenu size={28} />}
        </button>

        {/* Logo */}
        <img src={NavbarBg} alt="Logo RSUP" className="h-10 object-contain" />

        {/* Greeting */}
        <div className="hidden sm:block text-sm font-bold">
          <span className="text-greenbangladesh">ABSENSI RSUP MAKASSAR</span><span className="font-medium">{activeMenu}</span>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
