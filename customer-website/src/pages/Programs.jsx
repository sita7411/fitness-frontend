import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Dumbbell,
  HeartPulse,
  Flame,
  Apple,
  Users,
  Timer,
  BarChart3,
  IdCard,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
  const categories = ["All", "Training", "Wellness", "Transformation", "Nutrition"];

  // ---------- Fetch Programs from API ----------
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/programs`);

        const safeData = data.map((p) => ({
          ...p,
          id: p.id || p._id || `program-${Math.random()}`,
          title: p.title || "Untitled Program",
          difficulty: p.difficulty || "Beginner",
          category: p.category || "Training",
          duration: p.duration || "30 – 45 min",
          image: p.thumbnail || "https://via.placeholder.com/1200x675?text=No+Image+Available",
          trainerName: p.trainerName || "FitTrack Trainer", 
          status: p.status || "Active", 
        }));



        setPrograms(safeData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch programs");
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const toggleStatus = async (programId) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    try {
      const res = await axios.patch(`${API_URL}/api/programs/${programId}/status`, {
        status: program.status === "Active" ? "Inactive" : "Active",
      });

      setPrograms(programs.map(p =>
        p.id === programId ? { ...p, status: res.data.status } : p
      ));
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle program status");
    }
  };

  // ---------- Filter Programs ----------
  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const isActive = program.status?.toLowerCase() === "active";
      const matchesDifficulty =
        selectedDifficulty === "All" || program.difficulty === selectedDifficulty;
      const matchesCategory =
        selectedCategory === "All" || program.category === selectedCategory;
      const matchesSearch = program.title
        ? program.title.toLowerCase().includes(searchQuery.toLowerCase())
        : false;

      return isActive && matchesDifficulty && matchesCategory && matchesSearch;
    });
  }, [programs, selectedDifficulty, selectedCategory, searchQuery]);


  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const currentItems = filteredPrograms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading)
    return <p className="text-center py-20 text-gray-500">Loading programs...</p>;

  if (error)
    return <p className="text-center py-20 text-red-500">{error}</p>;

  return (
    <div className="overflow-hidden bg-white text-black">
      {/* ================= HERO BANNER ================= */}
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
            Join our fitness revolution with personalized programs, expert trainers,
            and a supportive community built to help you thrive.
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

      {/* ================= PROGRAMS SECTION ================= */}
      <section id="programs" className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
          {/* ---------- Sidebar Filters ---------- */}
          <motion.aside
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/4 w-full lg:sticky lg:top-24 h-fit bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.05)]"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <Filter className="text-[#E3002A]" /> Filters
            </h3>

            {/* Search */}
            <div className="mb-6">
              <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#E3002A]/50">
                <Search className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-600 flex items-center gap-1">
                <BarChart3 size={15} className="text-[#E3002A]" /> Difficulty
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {difficulties.map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSelectedDifficulty(level);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${selectedDifficulty === level
                      ? "bg-[#E3002A] text-white border-[#E3002A]"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-600 flex items-center gap-1">
                <Apple size={15} className="text-[#E3002A]" /> Category
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${selectedCategory === cat
                      ? "bg-[#E3002A] text-white border-[#E3002A]"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* ---------- Program Cards ---------- */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {currentItems.length > 0 ? (
                currentItems.map((program, index) => {
                  const IconMap = {
                    Training: Dumbbell,
                    Wellness: HeartPulse,
                    Transformation: Flame,
                    Nutrition: Apple,
                  };
                  const Icon = IconMap[program.category] || Dumbbell;

                  return (
                    <motion.div
                      key={program.id}
                      whileHover={{ y: -5 }}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-[0_10px_25px_rgba(227,0,42,0.2)] transition-all duration-500"
                    >
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={program.image}
                          alt={program.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-3 left-4 text-white flex items-center gap-2">
                          <Icon className="h-8 w-8 text-[#E3002A]" />
                          <h3 className="text-lg font-semibold tracking-wide drop-shadow-md">
                            {program.title}
                          </h3>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex flex-wrap text-xs text-gray-600 gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            <Timer size={20} className="text-[#E3002A]" /> {program.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={20} className="text-[#E3002A]" /> {program.trainerName || "Trainer"}
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 size={20} className="text-[#E3002A]" /> {program.difficulty}
                          </div>
                        </div>

                        <Link
                          to={`/program/${program.id}`}
                          className="block text-center px-4 py-2 bg-[#E3002A] text-white text-sm font-semibold rounded-full shadow hover:bg-[#ff0033] transition-all duration-300"
                        >
                          View Program
                        </Link>
                      </div>

                    </motion.div>
                  );
                })
              ) : (
                <p className="col-span-full text-center text-gray-500 py-10">
                  No programs found matching your filters.
                </p>
              )}
            </motion.div>

            {/* ---------- Pagination ---------- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-1.5 rounded-full border text-sm font-medium ${currentPage === i + 1
                      ? "bg-[#E3002A] text-white border-[#E3002A]"
                      : "border-gray-300 hover:bg-gray-100"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Programs;
