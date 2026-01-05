import React, {useState} from "react";
import {FaRegEye, FaRegEyeSlash} from "react-icons/fa";

const Input = ({value, onChange, label, placeholder, type}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div>
      <label className="text-[13px] text-slate-800">{label}</label>
      <div className="input-box flex items-center border p-2 rounded-md">
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent outline-none"
        />

        {type === "password" && (
          <>
            {showPassword ? (
              <FaRegEyeSlash size={20} className="cursor-pointer text-black" onClick={toggleShowPassword} />
            ) : (
              <FaRegEye size={20} className="cursor-pointer text-gray-500" onClick={toggleShowPassword} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Input;
