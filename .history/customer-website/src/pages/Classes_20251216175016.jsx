// src/pages/Classes.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useShop } from "../context/ShopContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CalendarDays,
  Clock,
  Timer,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const { addToCart } = useShop();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState(null);
  const itemsPerPage = 6;

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes");
      const activeClasses = res.data.filter(cls => cls.status === "Active");
      const transformedClasses = res.data.map(cls => {
        const imageUrl = cls.thumbnail && !cls.thumbnail.startsWith('blob:')
          ? cls.thumbnail
          : "/placeholder-fitness.jpg";

        return {
          ...cls,
          imageUrl,
          thumbnail: imageUrl === "/placeholder-fitness.jpg" ? null : imageUrl
        };
      });
      setClasses(transformedClasses);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      toast.error("Failed to load classes. Please try again.");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleBooking = async (cls) => {
    if (cls.includedInProgram) {
      toast.info("This class is included in your program!", {
        toastId: `included-${cls._id}`,
      });
      return;
    }

    const normalizedClass = {
      _id: cls._id,
      type: "class",
      title: cls.title,
      desc: (cls.description || "No description").slice(0, 150) + "...",
      image: cls.thumbnail || "/placeholder-fitness.jpg",
      price: Number(cls.price) || 1,
      duration: cls.duration || "30–45 min",
      difficulty: cls.level || "Beginner",
      trainerName: cls.trainerName || "Self-Guided",
      category: "Class",
      quantity: 1,
    };

    try {
      await addToCart(normalizedClass);
    } catch (error) {
      console.error("Cart error:", error.response?.data || error);
      toast.error("Failed to add to cart. Try again.");
    }
  };


  const totalPages = Math.ceil(classes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClasses = classes.slice(indexOfFirstItem, indexOfLastItem);

  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const isIncluded = (cls) => cls.includedInProgram;

  const getImageSrc = (cls) => cls.imageUrl || cls.thumbnail?.url || cls.thumbnail || cls.image || "/placeholder-fitness.jpg";

  const isValidImage = (src) => src && src !== "/placeholder-fitness.jpg" && !src.startsWith("blob:");

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
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
        <div className="relative z-10 text-center px-6 mt-16 max-w-3xl">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold uppercase leading-tight"
          >
            Push Your Limits <br />
            with <span className="text-[#E3002A]">FitTrack</span>
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="text-gray-300 mt-5 text-base md:text-lg max-w-2xl mx-auto"
          >
            Track your progress, join live classes, and become part of a supportive fitness community.

          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="mt-8"
          >
            <a
              href="#programs"
              className="px-8 py-3 bg-[#E3002A] text-white font-semibold rounded-full shadow-lg hover:bg-[#ff0033] transition-all duration-300"
            >
              Explore Programs
            </a>
          </motion.div>
        </div>
      </section>

      {/* Classes Grid */}
      <div className="grid gap-10 mt-20 mb-10 mx-10 md:grid-cols-2 lg:grid-cols-3">
        {currentClasses.map((cls) => (
          <motion.div
            key={cls._id || cls.id}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-500 cursor-pointer"
            onClick={() => setSelectedClass(cls)} // Only opens modal
          >
            <div className="relative overflow-hidden">
              <div className="relative w-full h-56">
                {isValidImage(getImageSrc(cls)) ? (
                  <img
                    src={getImageSrc(cls)}
                    alt={cls.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = "/placeholder-fitness.jpg"; }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-all duration-500"></div>

              {cls.includedInProgram ? (
                <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md pointer-events-none">
                  Included
                </span>
              ) : (
                <span className="absolute top-4 right-4 bg-[#E3002A] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md pointer-events-none">
                  ₹{cls.price}
                </span>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
                <h2 className="text-2xl font-bold tracking-wide mb-1">{cls.title}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <User size={16} /> {cls.trainerName}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mb-20">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`p-2 rounded-full border flex items-center justify-center transition-colors ${currentPage === 1
            ? "text-gray-400 border-gray-300 cursor-not-allowed"
            : "text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center font-semibold transition-colors ${currentPage === i + 1
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-black border-gray-300 hover:bg-red-600 hover:text-white"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-full border flex items-center justify-center transition-colors ${currentPage === totalPages
            ? "text-gray-400 border-gray-300 cursor-not-allowed"
            : "text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Professional Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh] shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedClass(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors rounded-full bg-gray-100 hover:bg-gray-200 shadow-md z-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-5">
              {isValidImage(getImageSrc(selectedClass)) ? (
                <img src={getImageSrc(selectedClass)} alt={selectedClass.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <h2 className="text-3xl font-bold">{selectedClass.title}</h2>
              <span className={`mt-2 md:mt-0 px-4 py-2 rounded-full font-semibold text-white ${isIncluded(selectedClass) ? "bg-green-600" : "bg-[#E3002A]"}`}>
                {isIncluded(selectedClass) ? "Included in Program" : `₹${selectedClass.price}`}
              </span>
            </div>

            {/* Trainer */}
            <p className="text-gray-600 mb-4"><span className="font-semibold">Trainer:</span> {selectedClass.trainerName}</p>

            {/* Description */}
            {selectedClass.description && (
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-2">About this Class</h3>
                <p className="text-gray-700 leading-relaxed">{selectedClass.description}</p>
              </div>
            )}

            {/* Class Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 text-gray-700">
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg"><CalendarDays size={16} /> {selectedClass.date || "TBD"}</div>
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg"><Clock size={16} /> {selectedClass.time || "TBD"}</div>
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg"><Timer size={16} /> {selectedClass.duration || "30-45 min"}</div>
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg"><BarChart3 size={16} /> {selectedClass.level || "Beginner"}</div>
              {selectedClass.notes && <div className="col-span-full bg-gray-100 px-3 py-2 rounded-lg"><span className="font-semibold">Notes: </span>{selectedClass.notes}</div>}
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => handleBooking(selectedClass)}
              disabled={isIncluded(selectedClass)}
              className={`w-full py-3 rounded-xl font-semibold text-white text-lg shadow-md transition-all duration-300 ${isIncluded(selectedClass) ? "bg-gray-400 cursor-not-allowed" : "bg-[#E3002A] hover:bg-red-700 hover:shadow-lg"}`}
            >
              {isIncluded(selectedClass) ? "Included in Program" : "Add to Cart"}
            </button>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="dark"
        toastStyle={{
          backgroundColor: "#1E1E1E",
          color: "#fff",
          borderLeft: "6px solid #E3002A",
          fontFamily: "Poppins, sans-serif",
          borderRadius: "8px",
        }}
      />
    </div>
  );
};

export default Classes;
