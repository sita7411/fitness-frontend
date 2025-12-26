// src/pages/AuthPage.jsx (या जहां भी है)
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";  // ← IMPORT

export default function AuthPage() {
    const navigate = useNavigate();
    const { login, loading } = useAdminAuth();  // ← USE CONTEXT

    const [email, setEmail] = useState("admin@gmail.com");
    const [password, setPassword] = useState("Admin@123");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please fill all fields");
            return;
        }

        const result = await login(email, password);  // ← CONTEXT KA LOGIN USE KARO

        if (result.success) {
            toast.success("Login Successful!");
            setTimeout(() => {
                navigate("/dashboard");
            }, 800);
        }
        // Error already handled by context (toast.error)
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
                <div className="flex justify-center mb-5">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-80 h-80 -mt-30 -mb-30 object-contain drop-shadow-xl"
                    />
                </div>

                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-wide">
                    Admin Login
                </h2>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="inputPro">
                        <Mail size={20} className="iconRed" />
                        <input
                            type="email"
                            placeholder="Admin Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
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
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold
                            bg-[#e3002a] hover:bg-[#c10022] text-white
                            shadow-lg hover:shadow-xl transition disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center mt-4 text-sm text-gray-600 hover:text-[#e3002a] cursor-pointer">
                    Forgot Password?
                </p>
            </form>
            </motion.div>

<style>{`
                .inputPro {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px 18px;
                    border-radius: 14px;
                    border: 1px solid #e5e5e5;
                    background: #fafafa;
                    transition: 0.25s ease;
                }
                .inputPro:hover {
                    border-color: #e3002a;
                }
                .iconRed {
                    color: #e3002a;
                }
                .inputPro input {
                    width: 100%;
                    background: transparent;
                    outline: none;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
