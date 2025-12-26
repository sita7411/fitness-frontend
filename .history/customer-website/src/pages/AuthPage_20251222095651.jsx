// src/pages/AuthPage.jsx → FINAL FIXED VERSION
import { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext"; // ← Confirm correct path
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
  const { login, api, checkAuth } = useUserAuth(); // ← checkAuth bhi le lo

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

    if (isLoading) return;

    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    if (!isLogin && (!name.trim() || !phone.trim() || !dob || !selectedGender)) {
      toast.error("All fields are required for signup");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        console.log("Attempting login for:", email.trim().toLowerCase());

        const result = await login(email.trim().toLowerCase(), password);

        if (result?.success) {
          toast.success("Login Successful!");
          // Manual checkAuth call to refresh state immediately
          await checkAuth();
          navigate("/");
        } else {
          toast.error(result?.message || "Invalid email or password");
        }
      } else {
        // SIGNUP
        console.log("Attempting signup for:", email.trim().toLowerCase());

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("email", email.trim().toLowerCase());
        formData.append("password", password);
        formData.append("phone", phone.trim());
        formData.append("gender", selectedGender);
        formData.append("dob", dob);

        const res = await api.post("/auth/signup", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.status === 201) {
          toast.success("Account created successfully!");
          setTimeout(() => {
            setIsLogin(true);
            toast.info("Now login with your new credentials");
            setName("");
            setEmail("");
            setPassword("");
            setPhone("");
            setDob("");
            setSelectedGender("");
          }, 1000);
        }
      }
    } catch (err) {
      console.error("Auth Error Details:", err); // ← YE DEKHO CONSOLE MEIN

      let msg = "Something went wrong. Please try again.";

      if (err.response) {
        // Server responded with error
        msg = err.response.data?.message || msg;
        if (err.response.status === 401) msg = "Invalid email or password";
        if (err.response.status === 403) msg = err.response.data.message;
      } else if (err.request) {
        // No response (CORS, network, server down)
        msg = "Cannot connect to server. Check your internet or backend.";
      }

      toast.error(msg);
    } finally {
      setIsLoading(false); // ← YE BAHUT ZAROORI – always run
    }
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setIsDropdownOpen(false);
  };

  const genderOptions = ["Male", "Female", "Other"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-gray-100 to-gray-300">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-white rounded-3xl p-10 shadow-2xl border border-gray-200"
      >
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-72 h-72 object-contain drop-shadow-2xl"
          />
        </div>

        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          {isLogin ? "Welcome Back!" : "Create Your Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Signup Fields */}
          {!isLogin && (
            <>
              <div className="inputPro">
                <User size={20} className="iconRed" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="inputPro">
                <Phone size={20} className="iconRed" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <div
                  className="inputPro cursor-pointer select-none"
                  onClick={() => !isLoading && setIsDropdownOpen(!isDropdownOpen)}
                >
                  <UserCircle size={20} className="iconRed" />
                  <span className={selectedGender ? "text-gray-800" : "text-gray-500"}>
                    {selectedGender || "Select Gender"}
                  </span>
                  <ChevronDown size={20} className={`ml-auto transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </div>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                    {genderOptions.map((option) => (
                      <div
                        key={option}
                        className="px-5 py-3 hover:bg-red-50 cursor-pointer text-gray-700"
                        onClick={() => handleGenderSelect(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="inputPro">
                <Calendar size={20} className="iconRed" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div className="inputPro">
            <Mail size={20} className="iconRed" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="inputPro">
            <Lock size={20} className="iconRed" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#e3002a] to-[#c10022] hover:shadow-2xl hover:scale-[1.02]"
            }`}
          >
            {isLoading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={toggleForm}
            className="text-[#e3002a] font-bold cursor-pointer hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </motion.div>

      <style jsx>{`
        .inputPro {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border-radius: 16px;
          border: 1.5px solid #e0e0e0;
          background: #fcfcfc;
          transition: all 0.3s ease;
        }
        .inputPro:hover {
          border-color: #e3002a;
          background: #fff;
        }
        .inputPro:focus-within {
          border-color: #e3002a;
          box-shadow: 0 0 0 4px rgba(227, 0, 42, 0.15);
        }
        .iconRed {
          color: #e3002a;
          flex-shrink: 0;
        }
        .inputPro input {
          width: 100%;
          background: transparent;
          outline: none;
          font-size: 15px;
          font-weight: 500;
        }
        .inputPro input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}