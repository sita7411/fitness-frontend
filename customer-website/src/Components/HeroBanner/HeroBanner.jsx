import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HeroBanner = () => {
  return (
    <section className="relative bg-black text-white pt-28 pb-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between relative z-10">

        {/* Left Text Section */}
        <motion.div
          className="text-center md:text-left md:w-1/2 space-y-6"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Take Control of Your{" "}
            <span className="text-[#E3002A]">Health & Fitness</span>
          </motion.h1>

          <motion.p
            className="text-gray-300 text-lg max-w-md mx-auto md:mx-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Track your workouts, follow meal plans, and stay motivated — all in
            one personalized fitness dashboard designed for your success.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Link
              to="/programs"
              className="bg-[#E3002A] text-white px-8 py-3 rounded-md font-semibold hover:bg-red-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="border border-red-600 text-[#E3002A] px-8 py-3 rounded-md font-semibold hover:bg-red-600 hover:text-white transition-colors"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Image Section */}
        <motion.div
          className="mt-12 md:mt-0 md:w-1/2 flex justify-center"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 1 }}
        >
          <img
            src="/hero-illustration.png"
            alt="Fitness Illustration"
            className="w-full max-w-lg drop-shadow-2xl rounded-3xl"
          />
        </motion.div>
      </div>

      {/* Decorative Background Elements */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 bg-red-700/20 rounded-full blur-3xl opacity-70"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      ></motion.div>
      <motion.div
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-700/20 rounded-full blur-3xl opacity-70"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
      ></motion.div>
    </section>
  );
};

export default HeroBanner;
