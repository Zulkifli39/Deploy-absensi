import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MENU_FOOTER } from "../../utils/Data";

const Footer = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="bg-white border-t border-gray-200 rounded-t-3xl px-4 pt-2 pb-3 sticky bottom-0 z-50 min-h-[72px]">
      <div className="flex justify-around items-end">
        {MENU_FOOTER.map((item, index) => {
          const isActive = pathname === item.path;
          const isCenter = index === 2;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center text-center transition"
            >
              {/* ICON */}
              <div
                className={`flex items-center justify-center rounded-full transition
                  ${isCenter ? "w-12 h-12 bg-turqoise shadow-lg" : "w-8 h-8"}
                `}
              >
                <item.icon
                  size={isCenter ? 25 : 22}
                  className={
                    isCenter
                      ? "text-white"
                      : isActive
                      ? "text-turqoise"
                      : "text-gray-400"
                  }
                />
              </div>

              {/* LABEL */}
              {!isCenter && (
                <span
                  className={`text-[12px] mt-1 ${
                    isActive
                      ? "text-turqoise font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Footer;
