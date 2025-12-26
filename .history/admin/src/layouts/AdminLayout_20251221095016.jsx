// src/layouts/AdminLayout.jsx

import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLayout() {
  const { isLoggedIn, loading } = useAdminAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";  // ya "/admin/login" jo bhi hai

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F8FA]">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  // Agar logged in nahi → login page par bhej do
  if (!isLoggedIn && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  // Agar login page par hai aur already logged in → dashboard par bhej do
  if (isLoginPage && isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  // Agar login page hai → sirf content dikhao (no sidebar/navbar)
  if (isLoginPage) {
    return <Outlet />;
  }

  // Normal admin dashboard layout
  return (
    <div className="flex min-h-screen bg-[#F6F8FA]">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}