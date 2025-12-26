import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, loading, isLoggedIn } = useAdminAuth();

  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("Admin@123");

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    const result = await login(email.trim().toLowerCase(), password);

    if (result?.success) {
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full m-5 max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
      >
        {/* Logo Section */}
          <div className="flex justify-center -mb-20 -mt-20">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-80 h-80 object-contain drop-shadow-2xl"
          />
        </div>

        <div className="px-10 pb-12">
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
            Admin Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="inputPro">
              <Mail size={22} className="iconRed" />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="inputPro">
              <Lock size={22} className="iconRed" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg
                         bg-gradient-to-r from-[#e3002a] to-[#c10022]
                         shadow-lg hover:shadow-2xl hover:scale-[1.02]
                         transition-all duration-300
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
            Use: <span className="font-medium">admin@gmail.com</span> /{" "}
            <span className="font-medium">Admin@123</span>
          </p>
        </div>
      </motion.div>

      <style >{`
        .inputPro {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 16px;
          border: 2px solid #e5e7eb;
          background: #fcfcfc;
          transition: all 0.3s ease;
        }
        .inputPro:hover {
          border-color: #e3002a;
          background: #ffffff;
        }
        .inputPro:focus-within {
          border-color: #e3002a;
          box-shadow: 0 0 0 4px rgba(227, 0, 42, 0.18);
        }
        .iconRed {
          color: #e3002a;
          flex-shrink: 0;
        }
        .inputPro input {
          width: 100%;
          background: transparent;
          outline: none;
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
        }
        .inputPro input::placeholder {
          color: #9ca3af;
        }
        .inputPro input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}