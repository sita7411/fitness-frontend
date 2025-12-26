import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Calendar,
  Apple,
  ListChecks,
  Trophy,
  CreditCard,
  FileBarChart,
  BarChart2,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import "./Sidebar.css";


export default function AdminSidebar({ onLogout }) {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState("");

  const toggle = (name) => {
    setOpenDropdown(openDropdown === name ? "" : name);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },

    {
      name: "Members",
      icon: Users,
      path: "/allmembers",  // direct link
    },

    {
      name: "Trainers",
      icon: Dumbbell,
      path: "/trainers",
    },
    {
      name: "Schedule",
      icon: Calendar,
      path: "/schedule",
    },

    {
      name: "  Workouts",
      icon: ListChecks,
      subMenu: [
        { label: "All Programs", path: "/workouts" },
        { label: "Create Program", path: "/createworkout" },
      ],
    },

    {
      name: "Classes ",
      icon: Calendar,
      subMenu: [
        { label: "All Classes", path: "/allclasses" },
        { label: "Create Class", path: "/createclasses" },
      ],
    },

    {
      name: "Nutrition Plans",
      icon: Apple,
      subMenu: [
        { label: "All Plans", path: "/allplans" },
        { label: "Create Meal Plan", path: "/createplan" },
      ],
    },

    {
      name: "Challenges",
      icon: Trophy,
      subMenu: [
        { label: "All Challenges", path: "/allchallenges" },
        { label: "Create Challenge", path: "/createchallenges" },
      ],
    },

    {
      name: "Memberships",
      icon: CreditCard, // you can choose another icon if you like
      path: "/membership"
    },

    { name: "Leaderboard", icon: BarChart2, path: "/leaderboard" },
    { name: "Notifications", icon: Bell, path: "/notifications" },

    {
      name: "Payments",
      icon: CreditCard,
      path: "/payments"
    },


  ];

  return (
    <>
      <div
        className="
    w-64 
    h-screen
    sticky top-0
    bg-white rounded-2xl 
    shadow-[0_0_20px_rgba(0,0,0,0.07)]
    p-6 
    flex flex-col
    border border-gray-100
    mt-4 mb-4 ml-3 overflow-y-scroll
    sidebar-custom
  "
      >

        {/* LOGO */}
        <div className="flex items-center gap-3 -mb-7 -mt-12 -ml-4">
          <div className="w-60 h-40 overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 mb-3 tracking-wider">
          ADMIN PANEL
        </p>

        <ul className="flex flex-col gap-1">
          {menu.map((item) => (
            <li key={item.name}>
              {item.subMenu ? (
                <>
                  <button
                    onClick={() => toggle(item.name)}
                    className={`
                      flex items-center justify-between w-full px-4 py-3 rounded-xl
                      text-sm whitespace-nowrap font-medium transition-all
                      ${openDropdown === item.name
                        ? "bg-[#e3002a]/10 text-[#e3002a] shadow-sm border border-[#e3002a]/20"
                        : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={20}
                        className={
                          openDropdown === item.name
                            ? "text-[#e3002a]"
                            : "text-gray-500"
                        }
                      />
                      {item.name}
                    </div>
                    {openDropdown === item.name ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {openDropdown === item.name && (
                    <ul className="ml-10 mt-1 flex flex-col gap-1">
                      {item.subMenu.map((sub) => (
                        <li key={sub.label}>
                          <Link
                            to={sub.path}
                            className={`
                              block px-3 py-2 rounded-lg text-sm
                              ${isActive(sub.path)
                                ? "bg-[#e3002a]/10 text-[#e3002a] font-medium border border-[#e3002a]/20"
                                : "text-gray-700 hover:bg-gray-100"
                              }
                            `}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    ${isActive(item.path)
                      ? "bg-[#e3002a]/10 text-[#e3002a] shadow-sm border border-[#e3002a]/20"
                      : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <item.icon
                    size={20}
                    className={
                      isActive(item.path)
                        ? "text-[#e3002a]"
                        : "text-gray-500"
                    }
                  />
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-gray-200 pt-4">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-100"
          >
            <Settings size={20} />
            Settings
          </Link>

          <button
            onClick={onLogout}
            className="
              flex items-center gap-3 px-4 py-3 rounded-xl w-full 
              bg-[#e3002a] text-white mt-5 mb-3 hover:bg-[#c60026] transition-all 
              text-sm font-semibold shadow-md
            "
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
