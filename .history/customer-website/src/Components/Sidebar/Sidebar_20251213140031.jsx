import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Dumbbell,
  Calendar,
  Apple,
  HeartPulse,
  Trophy,
  Bell,
  Settings,
  LogOut,
  BarChart2,
  Globe,
  Menu
} from "lucide-react";
import "./Sidebar.css";
import { useUserAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useUserAuth();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Dashboard", icon: Home, path: "/dashboard/home" },
    { label: "My Profile", icon: User, path: "/dashboard/myprofile" },
    { label: "My Workouts", icon: Dumbbell, path: "/dashboard/myworkouts" },
    { label: "My Classes", icon: Calendar, path: "/dashboard/myclasses" },
    { label: "Nutrition Plans", icon: Apple, path: "/dashboard/nutritionplans" },
    { label: "Health Metrics", icon: HeartPulse, path: "/dashboard/healthmetrics" },
    { label: "Challenges", icon: Trophy, path: "/dashboard/challenges" },
    { label: "Notifications", icon: Bell, path: "/dashboard/notifications" },
    { label: "Schedule", icon: BarChart2, path: "/dashboard/schedule" },
    { label: "Leaderboard", icon: BarChart2, path: "/dashboard/leaderboard" },
    { label: "Website Home", icon: Globe, path: "/" },

  ];

  const openSidebar = () => {
    document.querySelector(".sidebar-custom")
      ?.classList.toggle("sidebar-open");
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="hamburger-btn md:hidden"
        onClick={openSidebar}
      >
        <Menu size={26} />
      </button>

      <div
        className="
          sidebar-custom
          w-64 
          h-screen
          sticky top-0
          bg-white rounded-2xl
          shadow-[0_0_20px_rgba(0,0,0,0.07)]
          p-6 
          flex flex-col
          border border-gray-100 
          mt-4 mb-4 ml-3 overflow-y-scroll
        "
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 -mb-7 -mt-12 -ml-4">
          <div className="w-60 h-40 overflow-hidden">
            <img
              src="/logo.png"
              alt="Fittrack Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* MAIN MENU */}
        <p className="text-xs font-semibold text-gray-400 mb-3 tracking-wider">
          MAIN MENU
        </p>

        <ul className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 w-full rounded-xl
                  transition-all duration-200 text-sm font-medium
                  ${isActive(item.path)
                    ? "bg-[#e3002a]/10 text-[#e3002a] shadow-sm border border-[#e3002a]/20"
                    : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive(item.path) ? "text-[#e3002a]" : "text-gray-500"
                    }`}
                />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* SETTINGS SECTION */}
        <div className="mt-8 mb-3 border-t border-gray-200"></div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={async () => {
            await logout();          
            navigate("/login");      
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full bg-[#e3002a] text-white mt-auto hover:bg-[#c60026] transition-all duration-200 text-sm font-semibold shadow-md"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );
}
