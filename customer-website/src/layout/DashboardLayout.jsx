import { useState } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import DashboardNavbar from "../Components/DashboardNavbar/DashboardNavbar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const [open, setOpen] = useState(true);
  const toggleSidebar = () => setOpen(!open);

  return (
    <div className="flex min-h-screen bg-[#F6F8FA] ">

      {/* ---------- SIDEBAR ---------- */}
      <Sidebar open={open} toggleSidebar={toggleSidebar} />

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="flex-1 flex flex-col">
        {/* Dashboard Navbar */}
        <DashboardNavbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-29 pb-7 px-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
