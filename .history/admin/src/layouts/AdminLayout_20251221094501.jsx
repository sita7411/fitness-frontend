import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";  // ← IMPORT THIS

export default function AdminLayout() {
  const { isLoggedIn, loading } = useAdminAuth();  // ← Yeh lo context se
  const location = useLocation();

  // Agar login page par hai → sirf Outlet dikhao (no layout)
  const hideUI = location.pathname === "/admin/login";  // ← /admin/login ya jo bhi hai

  // ==========================================
  // 1. Jab tak authentication check ho raha hai → Loading dikhao
  // ==========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F8FA]">
        <div className="text-xl font-semibold text-gray-600">
          Loading Admin Dashboard...
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. Agar logged in nahi hai → Login page par bhej do
  // ==========================================
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  // ==========================================
  // 3. Agar login page par hai aur already logged in → Dashboard par bhej do
  // ==========================================
  if (hideUI && isLoggedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ==========================================
  // 4. Agar login page hai aur logged in nahi → Sirf children dikhao
  // ==========================================
  if (hideUI) {
    return <Outlet />;
  }

  // ==========================================
  // 5. Normal Admin Layout (Sidebar + Navbar + Content)
  // ==========================================
  return (
    <div className="flex min-h-screen bg-[#F6F8FA]">
      <Sidebar />

      <div className="flex-1 transition-all duration-300 relative">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 pb-7 px-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}