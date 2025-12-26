import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useShop } from "../context/ShopContext";
import axios from "axios";

// Member program (fetch from API or context)
const memberProgram = {
  id: 1,
  name: "Beginner Fitness Program",
  nutritionPlans: [], // Will be populated from API
};

const Nutrition = () => {
  const { addToCart, user } = useShop();
  const [nutritionTips, setNutritionTips] = useState([]);
  const [memberPlans, setMemberPlans] = useState([]); // User's included plans
  const [loading, setLoading] = useState(true);
  const [selectedTip, setSelectedTip] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  //  API CALLS
  useEffect(() => {
    fetchNutritionPlans();
    fetchMemberPlans();
  }, []);

  const fetchNutritionPlans = async () => {
    try {
      setLoading(true);
      //  GET ALL PLANS
      const response = await axios.get("http://localhost:5000/api/nutrition/");
      setNutritionTips(response.data);
    } catch (error) {
      console.error("Error fetching nutrition plans:", error);
      toast.error("Failed to load nutrition plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberPlans = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/nutrition/");

      //  REAL: Sirf backend se isIncluded: true wale plans
      const memberPlans = response.data.filter(plan => plan.isIncluded === true);

      setMemberPlans(memberPlans);
      memberProgram.nutritionPlans = memberPlans.map((p) => p._id);

      console.log(` ${memberPlans.length} REAL member plans loaded (isIncluded: true)`);
    } catch (error) {
      console.error("Error fetching member plans:", error);
      setMemberPlans([]);
      memberProgram.nutritionPlans = [];
    }
  };
  // Filtered tips based on filter
  const filteredTips = nutritionTips.filter((tip) => {
    if (filter === "included") return memberProgram.nutritionPlans.includes(tip._id);
    if (filter === "paid") return tip.price && tip.price > 0;
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTips = filteredTips.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTips.length / itemsPerPage);

  const isIncluded = (tip) => memberProgram.nutritionPlans.includes(tip._id || tip.id);

  const handleAddToCart = async (tip) => {
    if (isIncluded(tip)) {
      toast.info("This nutrition plan is included in your program!");
      return;
    }

    try {
      // Normalize tip for backend
      const itemToAdd = {
        id: tip._id,
        title: tip.title,
        desc: tip.description || tip.subtitle || "",
        image: tip.coverImage?.url || tip.image || "/default-plan.jpg",
        price: tip.price || 0,
        type: "nutrition",
        days: tip.days || [],
        coverImage: tip.coverImage || {},
        quantity: 1,
      };

      await addToCart(itemToAdd);

    } catch (error) {
      console.error("Add to cart error:", error.response?.data || error.message);
      toast.error("Failed to add item");
    }
  };

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E3002A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading nutrition plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mb-30">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center text-white">
        <motion.img
          src="/nutrition-banner.jpg"
          alt="Nutrition Banner"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center max-w-3xl px-6">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-extrabold uppercase tracking-wide"
          >
            Nutrition <span className="text-[#E3002A]">Plans</span>
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="text-gray-200 mt-4 text-lg md:text-xl"
          >
            {nutritionTips.length} healthy eating plans available
          </motion.p>
        </div>
      </section>

      {/* Filter */}
      <div className="flex justify-center gap-4 mt-12 mb-10">
        {["all", "paid"].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setCurrentPage(1); }}
            className={`px-5 py-2 rounded-full font-semibold transition-all ${filter === f
              ? "bg-[#E3002A] text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
              }`}
          >
            {f === "paid" ? "Paid" : "All"}
          </button>
        ))}
      </div>


      {/* Results Count */}
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Showing {currentTips.length} of {filteredTips.length} plans
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-10 mb-10 mx-6 md:grid-cols-2 lg:grid-cols-3">
        {currentTips.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No plans found for this filter</p>
            <button
              onClick={() => setFilter("all")}
              className="mt-4 px-6 py-2 bg-[#E3002A] text-white rounded-full font-semibold"
            >
              Show All Plans
            </button>
          </div>
        ) : (
          currentTips.map((tip) => (
            <motion.div
              key={tip._id || tip.id}
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ duration: 0.3 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-500 cursor-pointer"
              onClick={() => setSelectedTip(tip)}
            >
              <div className="relative h-56">
                <img
                  src={tip.coverImage?.url || tip.image || "/default-plan.jpg"}
                  alt={tip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-70"></div>
                <span
                  className={`absolute top-4 left-4 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-md ${tip.price === 0 || tip.free ? "bg-blue-600" : "bg-[#E3002A]"
                    }`}
                >
                  {tip.price === 0 || tip.free ? "Free" : `₹${tip.price}`}
                </span>

              </div>
              <div className="p-6 space-y-3">
                <h2 className="text-2xl font-bold line-clamp-2">{tip.title}</h2>
                <p className="text-gray-700 text-sm line-clamp-2">{tip.description || tip.subtitle}</p>
                <div className="flex items-center justify-between text-gray-500 text-ls mt-2">
                  <span className="flex items-center gap-1">
                    <User size={14} /> {tip.level || "Beginner"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {tip.days?.length || 0} days
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => { e.stopPropagation(); handleAddToCart(tip); }}
                  disabled={isIncluded(tip)}
                  className={`w-full py-3 mt-4 rounded-xl font-semibold text-white text-lg shadow-md transition-all duration-300 ${isIncluded(tip)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#E3002A] hover:bg-red-700 hover:shadow-lg"
                    }`}
                >
                  {isIncluded(tip) ? "✅ Included" : "Add to Cart"}
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination (same as before) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mb-20">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-full border flex items-center justify-center ${currentPage === 1
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center font-semibold ${currentPage === i + 1
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-black border-gray-300 hover:bg-red-600 hover:text-white"
                }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full border flex items-center justify-center ${currentPage === totalPages
              ? "text-gray-400 border-gray-300 cursor-not-allowed"
              : "text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modal (updated for real data) */}
      {selectedTip && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setSelectedTip(null)}
                className="absolute w-10 h-10 top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 text-gray-600 hover:text-gray-900 transition"
              >
                ✕
              </button>
              <img
                src={selectedTip.coverImage?.url || selectedTip.image}
                alt={selectedTip.title}
                className="w-full h-80 object-cover rounded-t-2xl"
              />
            </div>
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedTip.title}</h2>
                <p className="text-gray-600 text-lg">{selectedTip.description || selectedTip.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Level: <span className="font-semibold">{selectedTip.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Days: <span className="font-semibold">{selectedTip.days?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Meals: <span className="font-semibold">{selectedTip.days?.reduce((acc, day) => acc + day.meals.length, 0) || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  Price: <span className="font-semibold">{isIncluded(selectedTip) ? "Included" : `₹${selectedTip.price || 0}`}</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { handleAddToCart(selectedTip); setSelectedTip(null); }}
                disabled={isIncluded(selectedTip)}
                className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 ${isIncluded(selectedTip)
                  ? "bg-green-600 text-white cursor-default"
                  : "bg-[#E3002A] hover:bg-red-700 text-white"
                  }`}
              >
                {isIncluded(selectedTip) ? "Already Included in Your Program" : "Add to Cart"}
              </motion.button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
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

export default Nutrition;