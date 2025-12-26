import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "SARAH ANDERSON",
      role: "Personal Trainer",
      text: "Joining this fitness program was the best decision I ever made. The personalized workout plans and consistent motivation from the trainers helped me lose 10kg and build real strength!",
      imgMain:
        "/client-2.jpg",
      imgTop:
        "/client-1.jpg",
      imgBottom:
      "/trainer-3.jpg",
    },
    {
      name: "JAMES MILLER",
      role: "Nutrition Coach",
      text: "The community vibe and attention to detail here are incredible. My clients love how this gym focuses not just on workouts but also on nutrition, sleep, and total well-being.",
      imgMain:
        "/client-2.jpg",
      imgTop:
        "/client-1.jpg",
      imgBottom:
      "/trainer-3.jpg",
    },
    {
      name: "EMILY ROSS",
      role: "Yoga Instructor",
      text: "From strength training to mindfulness sessions, this place offers a holistic approach to health. I’ve seen my clients become not just fitter but truly happier.",
      imgMain:
        "/client-2.jpg",
      imgTop:
        "/client-1.jpg",
      imgBottom:
      "/trainer-3.jpg",
    },
  ];

  const [index, setIndex] = useState(0);
  const t = testimonials[index];

  const prev = () =>
    setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const next = () =>
    setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    const timer = setInterval(() => next(), 6000);
    return () => clearInterval(timer);
  }, [index]);

  return (
    <section className="w-full bg-white py-20 flex flex-col mb-28 -mt-7 md:flex-row items-center justify-center gap-1 px-5 md:px-16">
      {/* Left Side - Image Collage */}
      <div className="relative w-full md:w-1/2 ml-15 flex justify-center items-center min-h-[420px]">
        {/* Top Image */}
        <motion.img
          src={t.imgTop}
          alt="Top Trainer"
          animate={
            index === 0
              ? { scale: 1.1, boxShadow: "0px 0px 30px rgba(227,0,42,0.2)" }
              : { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" }
          }
          transition={{ duration: 0.5 }}
          className="absolute -top-6 -left-6 w-44 md:w-52 h-44 md:h-52 object-cover rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] transform rotate-[-8deg]"
        />

        {/* Main Image */}
        <motion.img
          src={t.imgMain}
          alt="Main Trainer"
          animate={
            index === 1
              ? { scale: 1.1, boxShadow: "0px 0px 35px rgba(227,0,42,0.2)" }
              : { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" }
          }
          transition={{ duration: 0.5 }}
          className="z-10 w-40 md:w-72 h-60 md:h-72 object-cover rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)]"
        />
        {/* Bottom Image */}
        <motion.img
          src={t.imgBottom}
          alt="Bottom Trainer"
          animate={
            index === 2
              ? { scale: 1.1, boxShadow: "0px 0px 30px rgba(227,0,42,0.2)" }
              : { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" }
          }
          transition={{ duration: 0.5 }}
          className="absolute -bottom-16 -left-7 w-48 md:w-56 h-48 md:h-56 object-cover rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] transform rotate-[7deg]"
        />
      </div>

      {/* Right Side - Text Content */}
      <div className="w-full md:w-1/2 text-center md:text-left flex flex-col justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-black relative inline-block">
            WHAT OUR CLIENTS SAY
          </h2>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <p className="text-gray-700 leading-relaxed italic max-w-xl mx-auto md:mx-0 mb-6">
                “ {t.text} ”
              </p>

              <div className="flex justify-center md:justify-start gap-1 mb-3 text-[#E3002A]">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <Star key={i} fill="currentColor" size={18} />
                  ))}
              </div>

              <p className="text-gray-500 text-sm mb-1 uppercase tracking-wide">
                {t.role}
              </p>
              <p className="text-lg font-semibold text-black">{t.name}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrows */}
        <div className="flex justify-center md:justify-start gap-4 mt-5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prev}
            className="p-3 border border-gray-300 rounded-full hover:bg-[#E3002A] hover:text-white text-black transition-all shadow-md"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={next}
            className="p-3 border border-gray-300 rounded-full hover:bg-[#E3002A] hover:text-white text-black transition-all shadow-md"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
