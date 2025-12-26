import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function TrainerSection() {
  const trainers = [
    {
      name: "Junifor Jonas",
      role: "Fitness Trainer",
      img: "/trainer-1.jpg",
    },
    {
      name: "Joan Thompson",
      role: "Boxing Trainer",
      img: "/trainer-2.jpg",
    },
    {
      name: "Monica Jand",
      role: "Yoga Coach",
      img: "/trainer-3.jpg",
    },
    {
      name: "Kody Roded",
      role: "Body Builder",
      img: "/trainer-4.jpg",
    },
  ];

  return (
    <section className="w-full bg-white py-27 px-6 sm:px-10 lg:px-24 text-gray-900">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900"
        >
          MEET OUR EXPERT TRAINERS
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-500 mt-4 max-w-2xl mx-auto text-base leading-relaxed"
        >
          A team of passionate coaches ready to guide your fitness journey.
        </motion.p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {trainers.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-500"
          >
            {/* Image */}
            <div className="relative overflow-hidden">
              <img
                src={t.img}
                alt={t.name}
                className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Diagonal overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#E3002A]/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 clip-diagonal"></div>

              {/* Floating Icons */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex flex-col justify-center items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700"
              >
                <motion.div
                  className="flex gap-5"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {[Instagram, Twitter, Facebook].map((Icon, idx) => (
                    <motion.a
                      key={idx}
                      href="#"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className="p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-800 shadow-lg hover:text-white hover:bg-[#E3002A] transition-all duration-300"
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  ))}
                </motion.div>
              </motion.div>

              {/* Accent bar (Option 3 influence) */}
              <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#E3002A] group-hover:w-full transition-all duration-500"></span>
            </div>

            {/* Info */}
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold group-hover:text-[#E3002A] transition-colors duration-300">
                {t.name}
              </h3>
              <p className="text-sm text-gray-500">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* Tailwind extension for diagonal clip */
<style jsx>{`
  .clip-diagonal {
    clip-path: polygon(0 100%, 0 60%, 100% 0, 100% 100%);
  }
`}</style>
