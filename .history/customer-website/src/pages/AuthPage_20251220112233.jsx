// src/pages/AuthPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/AuthContext"; 
import {
    Mail,
    Lock,
    User,
    Phone,
    Calendar,
    UserCircle,
    ChevronDown,
} from "lucide-react";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [selectedGender, setSelectedGender] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    // ✅ FIXED: Correct hook name
    const { login } = useUserAuth();

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setDob("");
        setSelectedGender("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!email || !password) {
            toast.error("Email and password are required");
            return;
        }

        if (!isLogin && (!name || !phone || !dob || !selectedGender)) {
            toast.error("All fields are required for signup");
            return;
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                // ✅ FIXED: Use context's login function directly
                const result = await login(email, password);
                
                if (result?.success) {
                    toast.success("Login Successful");
                    setTimeout(() => navigate("/"), 1200);
                } else {
                    toast.error("Login failed - please try again");
                }
            } else {
                // SIGNUP (no auto-login)
                const res = await fetch("http://localhost:5000/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password,
                        phone,
                        gender: selectedGender,
                        dob
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    toast.success("Account created successfully!");
                    setTimeout(() => {
                        setIsLogin(true);
                        toast.info("Please login with your new credentials");
                        setName("");
                        setPhone("");
                        setDob("");
                        setSelectedGender("");
                    }, 1500);
                } else {
                    toast.error(data.message || "Signup failed");
                }
            }
        } catch (err) {
            console.error("Auth error:", err);
            toast.error(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenderSelect = (gender) => {
        setSelectedGender(gender);
        setIsDropdownOpen(false);
    };

    const genderOptions = ["Male", "Female", "Other"];

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-gray-100 to-gray-300">
            {/* Your existing JSX - NO CHANGES NEEDED */}
            <ToastContainer
                position="top-right"
                autoClose={2000}
                theme="dark"
                toastOptions={{
                    style: {
                        backgroundColor: "#1E1E1E",
                        color: "#fff",
                        borderLeft: "6px solid #E3002A",
                        fontFamily: "Poppins, sans-serif",
                    },
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-lg bg-white rounded-3xl p-10 shadow-2xl border border-gray-200"
            >
                {/* Your existing form JSX - NO CHANGES NEEDED */}
                <div className="flex justify-center mb-4">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-80 h-80 -mt-30 -mb-30 object-contain drop-shadow-xl"
                    />
                </div>

                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-wide">
                    {isLogin ? "Welcome Back!" : "Create Your Account"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <>
                            <div className="inputPro">
                                <User size={20} className="iconRed" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    required
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="inputPro">
                                <Phone size={20} className="iconRed" />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    required
                                    autoComplete="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <div
                                    className="inputPro cursor-pointer"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <UserCircle size={20} className="iconRed" />
                                    <span className={`w-full ${selectedGender ? "text-gray-800" : "text-gray-400"}`}>
                                        {selectedGender || "Select Gender"}
                                    </span>
                                    <ChevronDown
                                        size={20}
                                        className={`ml-auto transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                                    />
                                </div>
                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                                        {genderOptions.map((option) => (
                                            <div
                                                key={option}
                                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleGenderSelect(option)}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <input type="hidden" name="gender" value={selectedGender} required />
                            </div>

                            <div className="inputPro">
                                <Calendar size={20} className="iconRed" />
                                <input
                                    type="date"
                                    name="dob"
                                    required
                                    autoComplete="bday"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className="inputPro">
                        <Mail size={20} className="iconRed" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="inputPro">
                        <Lock size={20} className="iconRed" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-xl font-semibold mt-4 transition ${isLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#e3002a] to-[#a9001d] text-white shadow-lg hover:shadow-xl hover:scale-[1.03]"
                            }`}
                    >
                        {isLoading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-700">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span
                        onClick={toggleForm}
                        className="text-[#e3002a] font-semibold cursor-pointer ml-1 hover:underline"
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </span>
                </p>
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
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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