// src/layouts/DashboardLayout.jsx
import React, { useContext, useState } from "react";
import SideMenu from "./SideMenu"; 
import Navbar from "./Navbar";
import { UserContext } from "../../context/UserContext";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */} 
      <SideMenu
        user={user}
        activeMenu={activeMenu}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((v) => !v)}
      />
      
      {/* Main Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? "lg:ml-16" : "lg:ml-60"
        }`}
      >
        {/* Navbar */}
        <Navbar
          activeMenu={activeMenu}
          isMobileOpen={isMobileOpen}
          onToggleMobile={() => setIsMobileOpen((v) => !v)}
        />
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;