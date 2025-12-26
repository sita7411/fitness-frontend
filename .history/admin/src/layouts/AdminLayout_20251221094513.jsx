import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const [open, setOpen] = useState(true);
  const toggleSidebar = () => setOpen(!open);

  const location = useLocation();

  const hideUI = location.pathname === "/login";

  if (hideUI) {
    return (
        <Outlet />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F6F8FA]">
      <Sidebar open={open} />

      <div className="flex-1 transition-all duration-300 relative">
        <Navbar open={open} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto pt-29 pb-7 px-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
