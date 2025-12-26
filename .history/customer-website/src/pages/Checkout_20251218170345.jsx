// src/pages/Checkout.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Dumbbell, HeartPulse, Flame, Apple, Users, Timer } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

/* ------------------------------
   CustomDropdown (unchanged)
   ------------------------------ */
const CustomDropdown = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E3002A] focus:border-[#E3002A] shadow-sm hover:shadow-md transition-all duration-200 flex justify-between items-center"
      >
        <span>{value || label}</span>
        <span className="text-gray-400">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, idx) => (
            <li
              key={idx}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-[#E3002A] hover:text-white transition-colors duration-200 ${value === option ? "bg-[#E3002A] text-white" : ""
                }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


/* ------------------------------
    OTPModal
   ------------------------------ */
const OTPModal = ({ open, onClose, onVerify, email, resendFn, cooldown }) => {
  const length = 6;
  const [digits, setDigits] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (open) {
      setDigits(Array(length).fill(""));
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < length - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKey = (e, idx) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = "";
        setDigits(next);
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        const next = [...digits];
        next[idx - 1] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").trim().slice(0, length);
    if (!/^\d+$/.test(paste)) return;
    const arr = Array(length).fill("");
    paste.split("").forEach((ch, i) => (arr[i] = ch));
    setDigits(arr);
    const filled = Math.min(length - 1, paste.length - 1);
    setTimeout(() => inputsRef.current[filled]?.focus(), 50);
  };

  const joined = digits.join("");
  const ready = joined.length === length && /^\d+$/.test(joined);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-[90%] max-w-md p-8 shadow-xl border-t-4 border-[#E3002A] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#E3002A] transition"
        >
          ✕
        </button>

        {/* Heading */}
        <h3 className="text-2xl font-bold text-center text-[#E3002A] mb-2">
          Enter OTP
        </h3>
        <p className="text-center text-gray-600 mb-6 text-sm">
          We have sent a 6-digit verification code to <strong>{email}</strong>
        </p>

        {/* OTP Inputs */}
        <div
          className="flex justify-between gap-3 mb-6"
          onPaste={handlePaste}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(e.target.value.replace(/\D/g, ""), i)}
              onKeyDown={(e) => handleKey(e, i)}
              maxLength={1}
              inputMode="numeric"
              className="w-14 h-14 text-center text-lg border-2 border-gray-300 rounded-lg focus:border-[#E3002A] focus:ring-2 focus:ring-[#E3002A] outline-none transition-all"
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onVerify(joined)}
            disabled={!ready}
            className={`w-full py-3 rounded-full font-semibold text-white transition ${ready ? "bg-[#E3002A] hover:bg-red-600" : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            Verify OTP
          </button>

          <button
            onClick={() => cooldown === 0 && resendFn()}
            disabled={cooldown !== 0}
            className={`w-full py-3 rounded-full border-2 font-medium transition ${cooldown === 0
              ? "border-[#E3002A] text-[#E3002A] hover:bg-[#E3002A] hover:text-white"
              : "border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {cooldown === 0 ? "Resend OTP" : `Resend in ${cooldown}s`}
          </button>
        </div>

        <p
          onClick={onClose}
          className="mt-5 text-center text-sm text-gray-500 hover:text-[#E3002A] cursor-pointer transition"
        >
          Cancel
        </p>
      </div>
    </div>
  );
};

/* ------------------------------
   Main Checkout Component (full)
  ------------------------------ */
const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items = [], total = 0, membershipId = null, isMembershipPurchase = false } = location.state || {};
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    nameOnCard: "",
    expiry: "",
    cvv: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal state + resend cooldown
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    } else {
      clearTimeout(cooldownRef.current);
    }
    return () => clearTimeout(cooldownRef.current);
  }, [resendCooldown]);

  // ---------- Form Validation ----------
  const validateForm = () => {
    const { name, email, phone, address, city, country } = userDetails;
    const { cardNumber, nameOnCard, expiry, cvv } = cardDetails;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const cardRegex = /^[0-9]{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^[0-9]{3}$/;

    if (!name || !email || !phone || !address || !city || !country) {
      toast.error("Please fill in all billing details!");
      return false;
    }
    if (!emailRegex.test(email)) {
      toast.error("Invalid email address!");
      return false;
    }
    if (!phoneRegex.test(phone)) {
      toast.error("Enter a valid 10-digit phone number!");
      return false;
    }
    if (!cardNumber || !nameOnCard || !expiry || !cvv) {
      toast.error("Please fill in all card details!");
      return false;
    }
    if (!cardRegex.test(cardNumber)) {
      toast.error("Card number must be 16 digits!");
      return false;
    }
    if (!expiryRegex.test(expiry)) {
      toast.error("Expiry must be in MM/YY format!");
      return false;
    }
    if (!cvvRegex.test(cvv)) {
      toast.error("CVV must be 3 digits!");
      return false;
    }

    return true;
  };

  // ---------- Send OTP ----------
  const sendOtp = async () => {
    if (!validateForm()) return;

    try {
      setIsProcessing(true);
      await axios.post("http://localhost:5000/api/otp/send", {
        email: userDetails.email,
      });

      toast.success("OTP sent to your email!");
      setOtpSent(true);
      setShowOtpModal(true);
      setResendCooldown(45); // start 45s cooldown
    } catch (err) {
      console.error("Send OTP Error:", err);
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsProcessing(false);
    }
  };


  // verifyOtp function 
  const verifyOtp = async (otpValue) => {
    if (!otpValue || otpValue.length !== 6) {
      toast.error("Enter a valid 6-digit OTP!");
      return;
    }

    try {
      setIsProcessing(true);

      // STEP 1: Exact type matches
      const exactPrograms = items.filter(
        (item) => (item.type || "").toString().toLowerCase() === "program"
      );
      const exactClasses = items.filter(
        (item) => (item.type || "").toString().toLowerCase() === "class"
      );
      const exactChallenges = items.filter(
        (item) => (item.type || "").toString().toLowerCase() === "challenge"
      );
      const exactNutrition = items.filter(
        (item) => {
          const type = (item.type || "").toString().toLowerCase().trim();
          return type === "nutrition" || type === "nutritionplan" || type === "mealplan";
        }
      );
      // STEP 2: Unclassified items (no type or unknown type)
      const unclassified = items.filter((item) => {
        const type = (item.type || "").toString().toLowerCase();
        return !["program", "class", "challenge"].includes(type);
      });

      // STEP 3: Fallback detection by title
      const fallbackPrograms = unclassified.filter((item) => {
        const title = (item.title || "").toLowerCase();
        return title.includes("program") || title.includes("week") || title.includes("transformation");
      });

      const fallbackClasses = unclassified.filter((item) => {
        const title = (item.title || "").toLowerCase();
        return title.includes("hiit") || title.includes("yoga") || title.includes("session") || title.includes("class");
      });

      const fallbackChallenges = unclassified.filter((item) => {
        const title = (item.title || "").toLowerCase();
        return title.includes("challenge") && !title.includes("program");
      });
      const fallbackNutrition = items.filter((item) => {
        const type = (item.type || "").toString().toLowerCase();
        if (["program", "class", "challenge", "nutrition"].includes(type)) return false;

        const title = (item.title || item.name || "").toLowerCase();
        return title.includes("nutrition") ||
          title.includes("meal") ||
          title.includes("diet") ||
          title.includes("eating") ||
          title.includes("plan") && title.includes("day");
      });
      // STEP 4: Final arrays (no overlap)
      let finalPrograms = [...exactPrograms, ...fallbackPrograms];
      let finalClasses = [...exactClasses, ...fallbackClasses];
      let finalChallenges = [...exactChallenges, ...fallbackChallenges];
      let finalNutrition = [...exactNutrition, ...fallbackNutrition]; // ← NAYA
      // Remove overlaps using IDs
      const programIds = new Set(finalPrograms.map((i) => i.id || i._id?.toString()));
      const classIds = new Set(finalClasses.map((i) => i.id || i._id?.toString()));
      const challengeIds = new Set(finalChallenges.map((i) => i.id || i._id?.toString()));

      // Clean duplicates
      finalPrograms = finalPrograms.filter((i) => !classIds.has(i.id || i._id) && !challengeIds.has(i.id || i._id));
      finalClasses = finalClasses.filter((i) => !programIds.has(i.id || i._id) && !challengeIds.has(i.id || i._id));
      finalChallenges = finalChallenges.filter((i) => !programIds.has(i.id || i._id) && !classIds.has(i.id || i._id));
      finalNutrition = finalNutrition.filter(i =>
        !programIds.has(i.id || i._id) &&
        !classIds.has(i.id || i._id) &&
        !challengeIds.has(i.id || i._id)
      );

      // MAP FOR BACKEND
      const programsForBackend = finalPrograms.map((item) => ({
        id: item.id || item.customId || item.programId || item._id?.toString(),
        title: item.title || "Program",
        price: Number(item.price) || 0,
        trainerName: item.trainerName || "Trainer",
      }));

      const classesForBackend = finalClasses.map((item) => {
        const id = item.id || item._id || item.classId;
        if (!id) return null;
        const idStr = String(id);
        return {
          _id: idStr,
          id: idStr,
          title: item.title || "Class",
          price: Number(item.price) || 0,
          trainerName: item.trainerName || "Trainer",
        };
      }).filter(Boolean);

      const challengesForBackend = finalChallenges.map((item) => {
        const id = item.id || item._id;
        if (!id) return null;
        const idStr = String(id);
        return {
          _id: idStr,
          id: idStr,
          title: item.title || "Challenge",
          price: Number(item.price) || 0,
          trainerName: item.trainerName || "Trainer",
        };
      }).filter(Boolean);

      const nutritionForBackend = finalNutrition.map((item) => {
        const id = item.id || item._id;
        if (!id) return null;
        return {
          _id: String(id),
          id: String(id),
          title: item.title || "Nutrition Plan",
          price: Number(item.price) || 0,
          trainerName: item.trainerName || "Nutritionist",
        };
      }).filter(Boolean);

      console.log("Sending to backend →", {
        programs: programsForBackend.length,
        classes: classesForBackend.length,
        challenges: challengesForBackend.length,
        nutrition: nutritionForBackend.length,
      });

      // SEND TO BACKEND
      await axios.post("http://localhost:5000/api/otp/verify", {
        email: userDetails.email,
        otp: otpValue,
        userDetails,
        cardDetails,
        programs: programsForBackend,
        classes: classesForBackend,
        challenges: challengesForBackend,
        nutrition: nutritionForBackend,
        totall,
         membershipId: membershipId,
      });

      toast.success("Purchase completed successfully!");
      setIsOtpVerified(true);
      setShowOtpModal(false);

      navigate("/enrollment-success", {
        state: { enrolledPrograms: items, total, userDetails },
      });
    } catch (err) {
      console.error("Verify OTP Error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setIsProcessing(false);
    }
  };

  // Resend wrapper used by modal
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setIsProcessing(true);
      await axios.post("http://localhost:5000/api/otp/send", { email: userDetails.email });
      toast.success("OTP resent to your email!");
      setResendCooldown(45);
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- No Items ----------
  if (!items || items.length === 0)
    return (
      <div className="text-center py-40 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">No Programs Selected!</h2>
        <Link
          to="/programs"
          className="px-6 py-3 bg-[#E3002A] text-white rounded-full font-semibold hover:bg-red-600 transition-all duration-300"
        >
          Browse Programs
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative w-full h-[400px] text-white text-center flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=1400&q=80"
            alt="Checkout Banner"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#E3002A]/60 to-black/90" />
        </div>

        {/* Animated icons */}
        <motion.div className="absolute inset-0 z-10 pointer-events-none">
          {[
            { icon: <Dumbbell size={40} />, x: "8%", y: "25%", delay: 0 },
            { icon: <HeartPulse size={34} />, x: "85%", y: "40%", delay: 1 },
            { icon: <Flame size={30} />, x: "20%", y: "75%", delay: 1.5 },
            { icon: <Apple size={28} />, x: "70%", y: "65%", delay: 2 },
            { icon: <Users size={38} />, x: "50%", y: "20%", delay: 0.5 },
            { icon: <Timer size={32} />, x: "60%", y: "15%", delay: 2.5 },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              style={{ position: "absolute", left: item.x, top: item.y }}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{ duration: 3, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
              className="text-white/70 drop-shadow-lg"
            >
              {item.icon}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 max-w-4xl mx-auto px-6"
        >
          <h1 className="text-5xl md:text-6xl mt-18 font-extrabold mb-4 uppercase tracking-[0.15em] drop-shadow-xl">
            Checkout
          </h1>
          <p className="text-gray-300 text-lg md:text-xl">
            Complete your enrollment and start your fitness journey.
          </p>
        </motion.div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10">
        {/* LEFT: Billing */}
        <div className="space-y-10 bg-white text-black rounded-2xl p-8 shadow-lg border border-gray-200">
          {/* Billing Info */}
          <div>
            <h2 className="text-xl font-semibold text-[#E3002A] mb-4">Billing Information</h2>
            <div className="space-y-4">
              {["name", "email", "phone", "address"].map((field) => (
                <input
                  key={field}
                  type={field === "email" ? "email" : "text"}
                  placeholder={
                    field === "name"
                      ? "Full Name"
                      : field === "email"
                        ? "Email"
                        : field === "phone"
                          ? "Phone Number"
                          : "Street Address"
                  }
                  value={userDetails[field]}
                  onChange={(e) => setUserDetails({ ...userDetails, [field]: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:border-[#E3002A] outline-none"
                />
              ))}

              <div className="grid grid-cols-2 gap-4">
                <CustomDropdown
                  label="Select City"
                  options={["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"]}
                  value={userDetails.city}
                  onChange={(val) => setUserDetails({ ...userDetails, city: val })}
                />
                <CustomDropdown
                  label="Select Country"
                  options={["India", "USA", "UK", "Canada", "Australia"]}
                  value={userDetails.country}
                  onChange={(val) => setUserDetails({ ...userDetails, country: val })}
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="text-xl font-semibold text-[#E3002A] mb-3">Payment Details</h2>
            <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-300">
              <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                <CreditCard size={20} className="text-[#E3002A]" />
                <span>Credit / Debit Card (Demo)</span>
              </div>

              <input
                type="text"
                placeholder="Card Number"
                maxLength={16}
                value={cardDetails.cardNumber}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, cardNumber: e.target.value.replace(/\D/g, "") })
                }
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:border-[#E3002A] outline-none"
              />
              <input
                type="text"
                placeholder="Name on Card"
                value={cardDetails.nameOnCard}
                onChange={(e) => setCardDetails({ ...cardDetails, nameOnCard: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:border-[#E3002A] outline-none"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:border-[#E3002A] outline-none"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="CVV"
                  maxLength={3}
                  value={cardDetails.cvv}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "") })
                  }
                  style={{ WebkitTextSecurity: "disc" }}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:border-[#E3002A] outline-none"
                />
              </div>
            </div>
          </div>

          {/* OTP Section (trigger remains, actual entry via modal) */}
          <div>
            {!otpSent && (
              <button
                onClick={sendOtp}
                className="w-full py-3 rounded-full bg-[#E3002A] text-white font-semibold hover:bg-red-600 transition-all duration-300 mt-1"
                disabled={isProcessing}
              >
                {isProcessing ? "Sending OTP..." : "Send OTP to Email"}
              </button>
            )}

            {otpSent && !isOtpVerified && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-3">OTP sent — check your email. Open the verification modal to enter it.</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowOtpModal(true)}
                    className="px-4 py-2 bg-[#E3002A] text-white rounded-full font-medium"
                  >
                    Open OTP Modal
                  </button>
                  <button
                    onClick={handleResend}
                    className={`px-4 py-2 rounded-full border ${resendCooldown === 0 ? "border-[#E3002A] text-[#E3002A]" : "border-gray-200 text-gray-500 cursor-not-allowed"}`}
                    disabled={resendCooldown !== 0 || isProcessing}
                  >
                    {resendCooldown === 0 ? "Resend OTP" : `Resend (${resendCooldown}s)`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Program Summary */}
        <div className="bg-white text-black rounded-2xl p-8 shadow-lg border border-gray-200 flex flex-col">
          <h2 className="text-xl font-semibold text-[#E3002A] mb-4">Program Summary</h2>
          <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2">
            {items.map((program, idx) => (
              <div key={idx} className="border border-gray-300 bg-gray-50 rounded-lg p-4 flex gap-4 items-start">
                <img
                  src={program.image}
                  alt={program.title}
                  className="rounded-md h-24 w-32 object-cover border border-gray-200"
                />
                <div className="flex-1 text-sm">
                  <h3 className="text-md font-bold">{program.title}</h3>
                  <p className="text-gray-600 mt-1">{program.desc}</p>
                  <div className="mt-2 text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{program.duration?.trim() || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trainer:</span>
                      <span>{program.trainerName || "Self-Guided"}</span>
                    </div>
                    {program.difficulty && (
                      <div className="flex justify-between">
                        <span>Difficulty:</span>
                        <span>{program.difficulty}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-2 text-[#E3002A] font-semibold">
                    <span>Price:</span>
                    <span>₹{program.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-300 my-5"></div>
          <div className="flex justify-between text-lg font-semibold mb-4">
            <span>Total:</span>
            <span className="text-[#E3002A]">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* OTP Modal (center popup) */}
      <OTPModal
        open={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={verifyOtp}
        email={userDetails.email}
        resendFn={handleResend}
        cooldown={resendCooldown}
      />

      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="dark"
        toastStyle={{
          backgroundColor: "#1E1E1E",
          color: "#fff",
          borderLeft: "6px solid #E3002A",
          fontFamily: "Poppins, sans-serif",
        }}
      />
    </div>
  );
};

export default Checkout;
