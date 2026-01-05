import React from "react";

const SplashScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-secondary">
      
      <img
        src="/src/assets/kemenkes.svg"
        alt="Logo"
        className="w-24 h-24 mb-4 animate-pulse"
      />

      <h1 className="text-xl font-semibold text-gray-800">
        Sistem Absensi
      </h1>

      <p className="text-sm text-turqoise font-semibold mt-1">
        RS Kemenkes Makassar
      </p>

      <div className="mt-6 flex gap-4">
        <span className="w-4 h-4 bg-turqoise rounded-full animate-bounce"></span>
        <span className="w-4 h-4 bg-turqoise rounded-full animate-bounce delay-150"></span>
        <span className="w-4 h-4 bg-turqoise rounded-full animate-bounce delay-300"></span>
      </div>
    </div>
  );
};

export default SplashScreen;
