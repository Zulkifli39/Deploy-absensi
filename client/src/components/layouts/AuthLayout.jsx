import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center items-center">
      <div className="w-full max-w-[390px] bg-transparent flex flex-col min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
