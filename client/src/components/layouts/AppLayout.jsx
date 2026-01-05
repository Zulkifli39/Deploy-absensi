import React from "react";
import { Outlet } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import DashboardLayout from "./DashboardLayout";
import UserLayout from "./UserLayout";

const AppLayout = () => {
  const { role } = useUser();

  if (
    role === "Admin" ||
    role === "Kepala Instalasi" ||
    role === "Kepala Sub-Instalasi"
  ) {
    return (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    );
  }

  // USERS
  return (
    <UserLayout>
      <Outlet />
    </UserLayout>
  );
};

export default AppLayout;
