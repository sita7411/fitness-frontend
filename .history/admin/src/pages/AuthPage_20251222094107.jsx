// src/pages/AuthPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer } from "react-toastify"; // toast import नहीं करना, context में already handle हो रहा
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, loading } = useAdminAuth(); // loading from context

  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("Admin@123");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      // toast context में handle होता है, लेकिन manual भी दिखा सकते हैं अगर चाहें
      return;
    }

    const result = await login(email.trim(), password);

    if (result?.success) {
      // Context already toast.success दिखाता है, लेकिन extra confirmation के लिए
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    }
    // Error cases already handled inside context with toast.error
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#EEF0F4]">
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl p-10 shadow-xl border border-gray-200"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8 -mt-12">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-64 h-64 object-contain drop-shadow-2xl"
          />
        </div>

        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-wide">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="inputPro">
            <Mail size={20} className="iconRed" />
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="inputPro">
            <Lock size={20} className="iconRed" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white
                       bg-[#e3002a] hover:bg-[#c10022] 
                       shadow-lg hover:shadow-xl transition-all duration-200
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600 hover:text-[#e3002a] cursor-pointer transition">
          Forgot Password?
        </p>
      </motion.div>

      <style >{`
        .inputPro {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 14px;
          border: 1px solid #e5e5e5;
          background: #fafafa;
          transition: all 0.25s ease;
        }
        .inputPro:hover {
          border-color: #e3002a;
          background: #fff;
        }
        .inputPro:focus-within {
          border-color: #e3002a;
          box-shadow: 0 0 0 3px rgba(227, 0, 42, 0.15);
        }
        .iconRed {
          color: #e3002a;
          flex-shrink: 0;
        }
        .inputPro input {
          width: 100%;
          background: transparent;
          outline: none;
          font-weight: 500;
          font-size: 15px;
        }
        .inputPro input::placeholder {
          color: #aaa;
        }
      `}</style>
    </div>
  );
}