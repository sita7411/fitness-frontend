import React from "react";
import "../AboutSection/About.css";
import { Dumbbell, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section className="about-section py-16 flex flex-col md:flex-row items-center justify-between gap-10 container mx-auto px-6 bg-white text-black overflow-hidden">
      
      {/* Left Image Section */}
      <motion.div
        className="relative flex justify-center items-center w-full md:w-1/2"
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        {/* Red Half Circle Background */}
        <motion.div
          className="absolute bg-[#E3002A] h-[350px] w-[350px] md:h-[500px] md:w-[500px] rounded-l-[500px] left-[25%] md:left-[20%] -z-10"
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        ></motion.div>

        {/* Running Woman Image */}
        <motion.img
          src="./running-man.png"
          alt="Running Woman"
          className="z-10 max-w-[85%] md:max-w-[90%] object-contain relative"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
        />

        {/* Decorative Wave Lines */}
        <div className="absolute left-[33%] top-[52%] transform -translate-y-1/2 hidden md:block">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="70"
            height="14"
            viewBox="0 0 70 14"
            fill="none"
          >
            <path
              d="M0 7C12 2 24 12 36 7C48 2 60 12 70 7"
              stroke="white"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Vertical Text */}
        <motion.h1
          className="absolute text-[70px] md:text-[110px] font-extrabold text-gray-200 rotate-90 right-[-70px] md:right-[-180px] tracking-[6px] select-none opacity-40"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          RUNNING
        </motion.h1>
      </motion.div>

      {/* Right Text Section */}
      <motion.div
        className="w-full md:w-1/2"
        initial={{ opacity: 0, x: 80 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className="inline-block bg-[#E3002A] text-white text-xs font-semibold px-4 py-1 rounded-sm mb-4 tracking-widest">
          ABOUT FitTrack
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold leading-snug mb-4 text-black">
          Build Strength, <br />
          <span className="relative text-[#E3002A]">
            Boost Your Energy!
            <span className="underline-shape"></span>
          </span>
        </h2>

        <p className="text-gray-600 mb-8">
          At <strong>FitTrack</strong>, we focus on helping you create a healthy
          balance between body and mind. Our programs combine strength training,
          cardio, and mindfulness to help you achieve lasting wellness and
          vitality. Every move counts — and every step brings you closer to a
          stronger you.
        </p>

        {/* Features */}
        <div className="space-y-6">
          <motion.div
            className="flex items-start gap-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-[#ffe6ea] p-3 rounded-full shadow-md shadow-[#E3002A]/30">
              <Dumbbell className="text-[#E3002A]" size={22} />
            </div>
            <div>
              <h4 className="font-bold text-black text-lg">
                Personalized Fitness Plans
              </h4>
              <p className="text-gray-600 text-sm">
                Tailored workouts designed to match your goals and fitness
                level.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start gap-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-[#ffe6ea] p-3 rounded-full shadow-md shadow-[#E3002A]/30">
              <HeartPulse className="text-[#E3002A]" size={22} />
            </div>
            <div>
              <h4 className="font-bold text-black text-lg">Holistic Wellness</h4>
              <p className="text-gray-600 text-sm">
                Improve your health through balanced nutrition, movement, and
                recovery.
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA Button (No Animation) */}
        <button className="mt-8 bg-[#E3002A] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#b80020] transition-all duration-300">
          Start Your Fitness Journey
        </button>
      </motion.div>
    </section>
  );
};

export default AboutSection;
