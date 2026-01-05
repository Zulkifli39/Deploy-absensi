// import React from "react";
// import { Outlet } from "react-router-dom";
// import Footer from "./Footer";

// const UserLayout = () => {
//   return (
//     // <div className="w-full min-h-screen flex justify-center bg-secondary">
//     //   <div className="w-[390px] bg-secondary flex flex-col shadow-lg overflow-hidden">
        
//     //     {/* CONTENT */}
//     //     <div className="flex-1 overflow-y-auto ">
//     //       <Outlet />
//     //     </div>

//     //     {/* FOOTER */}
//     //     <Footer />
//     //   </div>
//     // </div>

//     <div className="w-full min-h-screen flex justify-center bg-secondary">
//   <div className="w-[390px] bg-secondary flex flex-col shadow-lg">
    
//     {/* CONTENT */}
//     <div className="flex-1 overflow-y-auto">
//       <Outlet />
//     </div>

//     {/* FOOTER */}
//     <Footer />
//   </div>
// </div>

//   );
// };

// export default UserLayout;


import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import SplashScreen from "../SplashScreen";

const UserLayout = () => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    setShowSplash(true);

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500); 

    return () => clearTimeout(timer);
  }, [location.pathname]); // Deteksi perubahan path

  return (
    <div className="w-full min-h-screen flex justify-center bg-secondary">
      <div className="w-[390px] bg-secondary flex flex-col shadow-lg min-h-screen">

        {showSplash ? (
          <SplashScreen />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <Outlet />
            </div>
            <Footer />
          </>
        )}

      </div>
    </div>
  );
};

export default UserLayout;
