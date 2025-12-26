import { useState } from "react";
import { motion } from "framer-motion";
import { Play, X } from "lucide-react";

export default function InspirationSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section
      className="relative w-full bg-cover bg-center mt-5 py-14 sm:py-20"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=1500&q=80')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/75"></div>

      {/* CONTENT */}
      <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-white z-10">
        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug">
            Gyms Don’t Change <br />
            <span className="text-[#E3002A]">Lives. People Do.</span>
          </h2>

          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-md">
            Real transformation doesn’t come from machines or memberships—it
            comes from people who show up, push harder, and inspire others to
            do the same. At <strong>FitTrack</strong>, we believe strength is
            built from within, together.
          </p>

          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 bg-[#E3002A] text-white font-medium text-xs sm:text-sm px-6 py-2.5 rounded-sm transition-all duration-300 hover:bg-[#c90026]"
          >
            READ MORE →
          </motion.a>
        </motion.div>

        {/* RIGHT SIDE — VIDEO SECTION */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative flex justify-center"
        >
          <div className="relative w-full max-w-sm sm:max-w-md rounded-lg overflow-hidden shadow-2xl">
            {!isPlaying ? (
              <>
                {/* IMAGE PREVIEW */}
                <img
                  src="/fitness-video-img.jpg"
                  alt="Fitness Inspiration"
                  className="w-full h-52 sm:h-72 object-cover"
                />

                {/* PLAY BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="bg-white text-[#E3002A] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg">
                    <Play size={22} fill="#E3002A" />
                  </div>
                </motion.button>
              </>
            ) : (
              <div className="relative">
                {/* VIDEO PLAYER */}
                <video
                  src="/fitness-video.mp4"
                  autoPlay
                  controls
                  className="w-full h-52 sm:h-72 object-cover"
                ></video>

                {/* CLOSE BUTTON */}
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-2 right-2 bg-[#E3002A] text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#c90026] transition"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
