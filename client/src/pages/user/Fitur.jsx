import React from "react";
import { MENU_FITUR } from "../../utils/Data";
import { Link } from "react-router-dom";

const Fitur = () => {
  return (
    <div className="mt-6">
      <div className="grid grid-cols-4 gap-4">
        {MENU_FITUR.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
          >
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-md">
              <img
                src={item.icon}
                alt={item.label}
                className="w-5 h-5"
              />
            </div>
            <span className="text-[12px] mt-1 font-regular text-center">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Fitur;
