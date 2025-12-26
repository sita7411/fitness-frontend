
import { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/AuthContext.jsx"; 
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
  const { login, api } = useUserAuth();

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

    if (isLoading) {
      console.log("Prevented double submit");
      return;
    }

    // Validation
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    if (!isLogin && (!name.trim() || !phone.trim() || !dob || !selectedGender)) {
      toast.error("All fields are required for signup");
      return;
    }

    console.log("🚀 Starting submission...", { isLogin, email: email.trim() });

    setIsLoading(true);

    try {
      if (isLogin) {
        console.log("Attempting login...");
        const result = await login(email.trim().toLowerCase(), password);

        console.log("Login result received:", result);

        if (result?.success) {
          toast.success("Login Successful!");
          navigate("/");
        } else {
          toast.error(result?.message || "Login failed – please try again");
        }
      } else {
        console.log("Attempting signup...");
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("email", email.trim().toLowerCase());
        formData.append("password", password);
        formData.append("phone", phone.trim());
        formData.append("gender", selectedGender);
        formData.append("dob", dob);

        const res = await api.post("/signup", formData);
        console.log("Signup response:", res.status, res.data);

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
    } catch (err) {
      console.error("Auth error:", err);
      const msg = err.response?.data?.message || (isLogin ? "Login failed" : "Signup failed");
      toast.error(msg);
    } finally {
      console.log("🛑 Loading finished");
      setIsLoading(false);
    }
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setIsDropdownOpen(false);
  };

  const genderOptions = ["Male", "Female", "Other"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-100 to-gray-300">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-white rounded-3xl p-10 shadow-2xl border border-gray-200"
      >
        <div className="flex justify-center -mb-20 -mt-20">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-80 h-80 object-contain drop-shadow-2xl"
          />
        </div>

        <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
          {isLogin ? "Welcome Back!" : "Create Your Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div className="inputPro">
                <User size={22} className="iconRed" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="inputPro">
                <Phone size={22} className="iconRed" />
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
                  className="inputPro cursor-pointer"
                  onClick={() => !isLoading && setIsDropdownOpen(!isDropdownOpen)}
                >
                  <UserCircle size={22} className="iconRed" />
                  <span className={selectedGender ? "text-gray-800" : "text-gray-500"}>
                    {selectedGender || "Select Gender"}
                  </span>
                  <ChevronDown size={22} className={`ml-auto transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </div>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-2xl shadow-xl z-20">
                    {genderOptions.map((option) => (
                      <div
                        key={option}
                        className="px-6 py-4 hover:bg-red-50 cursor-pointer text-gray-700 font-medium"
                        onClick={() => handleGenderSelect(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="inputPro">
                <Calendar size={22} className="iconRed" />
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
            <Mail size={22} className="iconRed" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="inputPro">
            <Lock size={22} className="iconRed" />
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
            className="w-full py-4 rounded-2xl font-bold text-white text-lg
                       bg-gradient-to-r from-[#e3002a] to-[#a9001d]
                       shadow-xl hover:shadow-2xl hover:scale-[1.02]
                       transition-all duration-300
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={toggleForm} className="text-[#e3002a] font-bold cursor-pointer hover:underline">
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </motion.div>

      <style >{`
        .inputPro {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 22px;
          border-radius: 18px;
          border: 2px solid #e5e7eb;
          background: #fcfcfc;
          transition: all 0.3s ease;
        }
        .inputPro:hover {
          border-color: #e3002a;
          background: #fff;
        }
        .inputPro:focus-within {
          border-color: #e3002a;
          box-shadow: 0 0 0 5px rgba(227, 0, 42, 0.2);
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