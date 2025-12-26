import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Facebook, Instagram, Globe, Link, ChevronLeft, ChevronRight } from "lucide-react";

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const trainersPerPage = 6;

  const fetchTrainers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/trainers", {
        params: { page, limit: trainersPerPage },
      });
      setTrainers(res.data.trainers || []);
      setTotalPages(Math.ceil((res.data.total || 0) / trainersPerPage));
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers(currentPage);
  }, [currentPage]);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <div className="overflow-hidden bg-white text-black">
      {/* TUMHARA PURANA EPIC BANNER - WAHI POWER WALA */}
      <section className="relative h-[90vh] flex items-center justify-center text-white">
        <motion.img
          src="/fitness-banner.jpg"
          alt="FitTrack Banner"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center px-6 mt-14 max-w-3xl">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold uppercase leading-tight"
          >
            Our<br />
            Power <span className="text-[#E3002A]">Team</span>
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="text-gray-300 mt-5 text-base md:text-lg max-w-2xl mx-auto"
          >
            Meet the experts behind strength, endurance, and transformation.
          </motion.p>
        </div>
      </section>

      {/* TRAINERS - AB BILKUL PROFESSIONAL & PREMIUM */}
      <section className="px-6 py-20 md:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-32">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-8 border-red-600 border-t-transparent"></div>
            </div>
          ) : trainers.length === 0 ? (
            <p className="text-center text-3xl text-gray-600 py-32 font-bold">No Trainers Found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
              {trainers.map((trainer, i) => (
                <motion.div
                  key={trainer._id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -12 }}
                  className="group relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={trainer.img || "/trainer-placeholder.jpg"}
                      alt={trainer.name}
                      className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-3xl font-bold drop-shadow-lg">{trainer.name}</h3>
                      <p className="text-red-500 font-bold text-lg drop-shadow-md">
                        {trainer.workout || "Elite Trainer"}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-8 text-center space-y-5 bg-white">
                    <p className="text-gray-600 italic leading-relaxed">
                      "{trainer.bio || "Dedicated to pushing limits and transforming lives through fitness."}"
                    </p>

                    {trainer.specialties?.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 pt-3">
                        {trainer.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs font-bold tracking-wider"
                          >
                            {spec.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Social Icons */}
                    <div className="flex justify-center gap-8 pt-4">
                      <motion.div whileHover={{ scale: 1.3 }} className="cursor-pointer">
                        <Instagram className="w-7 h-7 text-gray-500 hover:text-red-600 transition" />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.3 }} className="cursor-pointer">
                        <Facebook className="w-7 h-7 text-gray-500 hover:text-red-600 transition" />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.3 }} className="cursor-pointer">
                        <Globe className="w-7 h-7 text-gray-500 hover:text-red-600 transition" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl"></div>
                </motion.div>
              ))}
            </div>
          )}

          {/* TUMHARI PURANI PAGINATION - WAHI STYLE */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-16 gap-3 items-center">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-3 rounded-full border-2 transition-all ${
                  currentPage === 1
                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                }`}
              >
                <ChevronLeft size={24} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-12 h-12 rounded-full font-bold text-lg transition-all ${
                    currentPage === i + 1
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-gray-100 hover:bg-red-100 text-gray-800"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-3 rounded-full border-2 transition-all ${
                  currentPage === totalPages
                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                }`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}