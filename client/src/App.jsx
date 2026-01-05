import "./index.css";
import "leaflet/dist/leaflet.css";

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ROLES } from "./constants/roles";

import UserProvider from "./context/UserContext";
import PrivateRoute from "./routes/PrivateRoute";

// Toastify
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout
import AppLayout from "./components/layouts/AppLayout";
import AuthLayout from "./components/layouts/AuthLayout";

// Auth
import Login from "./pages/auth/login";

// User
import Home from "./pages/user/Home";
import Profile from "./pages/user/Profile";
import Fitur from "./pages/user/Fitur";
import AbsensiNew from "./pages/user/AbsensiNew";
import CheckIn from "./pages/user/CheckIn";
import CheckOut from "./pages/user/CheckOut";
import JamKerja from "./pages/user/JamKerja";
import Informasi from "./pages/user/Informasi";
import ProfilDetail from "./pages/user/ProfilDetail";
import ResetPassword from "./pages/user/ResetPassword";
import Keamanan from "./pages/user/Keamanan";
import LaporanAbsensi from "./pages/user/LaporanAbsensi";

// Dashboard
import DashboardPage from "./pages/admin/Dashboard";
import Laporan from "./pages/admin/Laporan";
import Department from "./pages/admin/Department";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageInformasi from "./pages/admin/ManageInformasi";
import Employee from "./pages/admin/Employee";
import RoleManagement from "./pages/admin/RoleManagement";
import ShiftManagement from "./pages/admin/ShiftManagement";
import SubDepartment from "./pages/admin/SubDepartment";
import Locations from "./pages/admin/Locations";
import SchedulePeriods from "./pages/admin/SchedulePeriods";
import UserShiftSchedule from "./pages/admin/UserShiftSchedule";
import UploadShiftSchedule from "./pages/admin/UploadShiftSchedule";
import OvertimeLembur from "./pages/admin/OvertimeLembur";

function App() {
  return (
    <UserProvider>
      <Router>
        <ToastContainer transition={Bounce} autoClose={3000} />
        

         {/* <ToastContainer
            position="bottom-center"
            autoClose={2500}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={false}
            transition={Bounce}
            limit={1}
            toastStyle={{
              borderRadius: "14px",
              fontSize: "13px",
              padding: "12px 16px",
            }}
            style={{
              zIndex: 99999,
              width: "92%",
              margin: "0 auto",
              bottom: "20px",
            }}
      /> */}


        <Routes>
          {/* LOGIN */}
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Login />} />
          </Route>

          <Route element={<PrivateRoute allowRoles={[ROLES.USER]} />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/fitur" element={<Fitur />} />
              <Route path="/absensi-new" element={<AbsensiNew />} />
              <Route path="/checkin" element={<CheckIn />} />
              <Route path="/checkout" element={<CheckOut />} />
              <Route path="/laporan-absensi" element={<LaporanAbsensi />} />
              <Route path="/jam-kerja" element={<JamKerja />} />
              <Route path="/info-osdm" element={<Informasi />} />
              <Route path="/detail-profil" element={<ProfilDetail />} />
              <Route path="/keamanan" element={<Keamanan />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
          </Route>

          <Route
            element={
              <PrivateRoute
                allowRoles={[
                  ROLES.ADMIN,
                  ROLES.KEPALA_INSTALASI,
                  ROLES.KEPALA_SUB_INSTALASI,
                ]}
              />
            }
          >
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* ADMIN ONLY */}
              <Route
                element={<PrivateRoute allowRoles={[ROLES.ADMIN]} />}
              >
                <Route path="/dashboard/department" element={<Department />} />
                <Route path="/dashboard/manage-users" element={<ManageUsers />} />
                <Route path="/dashboard/role-management" element={<RoleManagement />} />
                <Route path="/dashboard/manage-location" element={<Locations />} />
                <Route path="/dashboard/schedule-periods" element={<SchedulePeriods />} />
                <Route path="/dashboard/upload-shift-schedules" element={<UploadShiftSchedule />} />
                <Route path="/dashboard/status" element={<Employee />} />
                <Route path="/dashboard/manage-informasi" element={<ManageInformasi />} />
              </Route>

              {/* KEPALA INSTALASI KE ATAS */}
              <Route
                element={
                  <PrivateRoute
                    allowRoles={[ROLES.ADMIN, ROLES.KEPALA_INSTALASI]}
                  />
                }
              >
                <Route path="/dashboard/laporan-absensi" element={<Laporan />} />
                <Route path="/dashboard/overtime-lembur" element={<OvertimeLembur />} />
                <Route path="/dashboard/shift-management" element={<ShiftManagement />} />
                <Route path="/dashboard/sub-department" element={<SubDepartment />} />
              </Route>

              {/* KEPALA SUB INSTALASI KE ATAS */}
              <Route
                element={
                  <PrivateRoute
                    allowRoles={[
                      ROLES.ADMIN,
                      ROLES.KEPALA_INSTALASI,
                      ROLES.KEPALA_SUB_INSTALASI,
                    ]}
                  />
                }
              >
                <Route
                  path="/dashboard/user-shift-schedules"
                  element={<UserShiftSchedule />}
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
