import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserCircleIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useShop } from "../../context/ShopContext";
import { useUserAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.png"); // default fallback
  const [loadingLogo, setLoadingLogo] = useState(true);

  const location = useLocation();
  const accountRef = useRef(null);
  const { cartCount } = useShop();
  const { isLoggedIn, logout, user: authUser } = useUserAuth();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings", {
          credentials: "include", // Sends cookies automatically
        }); if (!res.ok) throw new Error("Failed to fetch settings");

        const data = await res.json();
        if (data.logo) {
          setLogoUrl(data.logo);
        }
      } catch (error) {
        console.error("Logo fetch error:", error);
        // Agar error aaye to default static logo hi rahega
      } finally {
        setLoadingLogo(false);
      }
    };

    fetchLogo();
  }, []);

  // Close dropdown when clicking outside (existing code)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Programs", path: "/programs" },
    { name: "Trainers", path: "/trainers" },
    { name: "Classes", path: "/classes" },
    { name: "Challenges", path: "/challenges" },
    { name: "Nutrition", path: "/nutrition" },
    { name: "Membership", path: "/membership" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">

          {/* ---------- LOGO ---------- */}
          <div className="flex-shrink-0">
            <Link to="/">
              {loadingLogo ? (
                <div className="h-14 w-40 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <img
                  className="h-45 mt-3 -ml-7 w-auto"
                  src={logoUrl}
                  alt="FitHealth"
                />
              )}
            </Link>
          </div>


          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md font-medium transition-colors ${isActive(link.path)
                    ? "bg-red-50 text-[#E3002A]"
                    : "text-gray-800 hover:text-[#E3002A]"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/cart"
              className="relative flex items-center text-gray-800 hover:text-[#E3002A] transition-colors"
            >
              <ShoppingCartIcon className="h-7 w-7" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#E3002A] text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center"
                >
                  {authUser?.avatar ? (
                    <img
                      src={authUser.avatar}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border-1 border-red-600"
                    />
                  ) : (
                    <UserCircleIcon className="h-9 w-9 text-gray-800 hover:text-[#E3002A]" />
                  )}
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-md shadow-lg py-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#E3002A] hover:bg-red-700 text-xs text-white whitespace-nowrap px-4 py-2 rounded-md font-medium"
              >
                Login / Signup
              </Link>
            )}
          </div>

          {/* Mobile menu button aur mobile menu bhi same rahega */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-800 hover:text-[#E3002A]"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ---------- MOBILE MENU ---------- */}
        {menuOpen && (
          <div className="md:hidden bg-white shadow-md absolute top-20 left-0 w-full z-40">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 text-gray-800 hover:text-[#E3002A] border-b border-gray-100"
              >
                {link.name}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-6 py-3 text-gray-800 hover:text-[#E3002A] border-b border-gray-100"
                >
                  My Profile
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-6 py-3 text-gray-800 hover:text-[#E3002A] border-b border-gray-100"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="block w-full text-left px-6 py-3 text-red-600 hover:bg-red-50 border-b border-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-3 bg-[#E3002A] text-white rounded-md mx-4 my-2 text-center"
              >
                Login / Signup
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
