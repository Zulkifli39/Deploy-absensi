// import { Navigate, Outlet } from "react-router-dom";
// import { useContext } from "react";
// import { UserContext } from "../context/UserContext";

// const PrivateRoute = ({ allowRoles = [] }) => {
//   const { user, loading } = useContext(UserContext);

//   if (loading) {
//     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
//   }

//   // ✅ Cek apakah user ada dan memiliki role
//   if (!user || !user.role) {
//     return <Navigate to="/" replace />;
//   }

//   // ✅ Ambil role dari dalam objek user
//   const userRole = user.role.toLowerCase().trim();
//   const allowedRoles = allowRoles.map(r => r.toLowerCase().trim());

//   if (!allowedRoles.includes(userRole)) {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// };

// export default PrivateRoute;


import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { ROLES } from "../constants/roles";

const PrivateRoute = ({ allowRoles = [] }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔐 Belum login
  if (!user || !user.user_role_id) {
    return <Navigate to="/" replace />;
  }
 

  return <Outlet />;
};

export default PrivateRoute;
