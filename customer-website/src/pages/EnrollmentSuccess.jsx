import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Home, LayoutDashboard, HeartPulse, Flame, Apple, Dumbbell, Timer } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const EnrollmentSuccess = () => {
  const location = useLocation();
  const { enrolledPrograms = [], total = 0, userDetails = {} } = location.state || {};

  return (
    <div className=" min-h-screen ">
      {/* ---------- HERO BANNER ---------- */}
      <section className="relative w-full h-[430px] flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=1400&q=80"
            alt="Cart Banner"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#E3002A]/60 to-black/90" />
        </div>


        {/* Floating Icons */}
        <motion.div className="absolute inset-0 z-10 pointer-events-none">
          {[
            { icon: <CheckCircle size={40} />, x: "10%", y: "30%", delay: 0 },
            { icon: <HeartPulse size={34} />, x: "85%", y: "40%", delay: 1 },
            { icon: <Flame size={30} />, x: "20%", y: "75%", delay: 1.5 },
            { icon: <Apple size={28} />, x: "70%", y: "65%", delay: 2 },
            { icon: <Dumbbell size={38} />, x: "50%", y: "20%", delay: 0.5 },
            { icon: <Timer size={32} />, x: "70%", y: "40%", delay: 2.5 },
          ].map((item, index) => (
            <motion.div
              key={index}
              style={{ position: "absolute", left: item.x, top: item.y }}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{
                duration: 3,
                delay: item.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-white/70 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
            >
              {item.icon}
            </motion.div>
          ))}
        </motion.div>

        {/* Hero Text */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
          className="relative z-20 flex flex-col items-center text-center px-6"
        >
          <CheckCircle
            size={100}
            className="text-green-500 mt-20 mb-4 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white uppercase tracking-widest">
            Enrollment Successful!
          </h1>
          <p className="text-gray-300 mt-3 text-lg max-w-2xl">
            Thank you{" "}
            <span className="text-white font-semibold">
              {userDetails.name || "User"}
            </span>
            , your enrollment has been confirmed! You’ll receive a confirmation email shortly.
          </p>
        </motion.div>
      </section>

      {/* ---------- DETAILS SECTION ---------- */}
      <div className="bg-white text-black flex-grow py-16 px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="rounded-2xl shadow-xl p-8 w-full max-w-4xl border border-gray-200 bg-gray-50"
        >
          <h2 className="text-2xl font-bold text-[#E3002A] mb-6 border-b border-gray-300 pb-3">
            Enrollment Summary
          </h2>

          {/* Program Details */}
          {enrolledPrograms.length > 0 ? (
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2">
              {enrolledPrograms.map((program, index) => (
                <div
                  key={index}
                  className="border border-gray-300 bg-white rounded-xl p-5 flex gap-5 items-start shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <img
                    src={program.image}
                    alt={program.title}
                    className="rounded-md h-24 w-32 object-cover border border-gray-200"
                  />
                  <div className="flex-1 text-sm">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {program.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{program.desc}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-semibold text-gray-700">
                        Price:
                      </span>
                      <span className="text-[#E3002A] font-bold">
                        ₹{program.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No program details found.</p>
          )}

          <div className="border-t border-gray-300 my-6"></div>

          {/* Total */}
          <div className="flex justify-between text-lg font-semibold">
            <span>Total Paid:</span>
            <span className="text-[#E3002A]">₹{total.toFixed(2)}</span>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-6 mt-10 flex-wrap justify-center"
        >
          <Link
            to="/dashboard"
            className="flex items-center gap-2 bg-[#E3002A] hover:bg-[#ff0033] px-8 py-3 rounded-full font-semibold text-white transition-all duration-300"
          >
            <LayoutDashboard size={20} /> Go to Dashboard
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 border-2 border-[#E3002A] text-[#E3002A] hover:bg-[#E3002A] hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
          >
            <Home size={20} /> Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default EnrollmentSuccess;
