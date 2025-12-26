import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useShop } from "../context/ShopContext";

const ChallengesPage = () => {
    const [challengesData, setChallengesData] = useState([]);
    const [filter, setFilter] = useState("all");
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 6;
    const { addToCart } = useShop();

    // ---------------- Fetch Challenges from API ----------------
    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get("http://localhost:5000/api/challenges"); // Your backend URL
                // Data is already an array
                setChallengesData(
                    data.map(ch => ({
                        id: ch._id,
                        name: ch.title,
                        description: ch.description,
                        images: [ch.thumbnail], // map thumbnail to images array
                        difficulty: ch.difficulty,
                        free: ch.price === 0,
                        price: ch.price,
                        trainer: "Self-Guided",
                        duration: `${ch.totalDays} day`,
                        categories: ch.categories,
                    }))
                );
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch challenges!");
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, []);

    const handleAddToCart = (challenge) => {
        if (challenge.includedInProgram) {
            toast.info("This challenge is included in your program!");
            return;
        }
        const cartItem = {
            id: challenge.id || challenge._id,
            title: challenge.name,
            desc: challenge.description,
            image: challenge.images?.[0] || "/challenges-placeholder.jpg",
            price: challenge.price,
            duration: challenge.duration,
            difficulty: challenge.difficulty || "Medium",
            category: "Challenge",
            trainerName: challenge.trainer || "Self-Guided",
            quantity: 1,
        };
        addToCart(cartItem);
    };

    const filteredChallenges = challengesData.filter((ch) => {
        if (filter === "free") return ch.free;
        if (filter === "paid") return !ch.free;
        return true;
    });

    const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentChallenges = filteredChallenges.slice(indexOfFirstItem, indexOfLastItem);

    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    if (loading) return <div className="text-center mt-20">Loading challenges...</div>;

    return (
        <div className="min-h-screen ">
            {/* Hero Banner */}
            <section className="relative h-[90vh] flex items-center justify-center text-white">
                <motion.img
                    src="/fitness-banner.jpg"
                    alt="Challenges Banner"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center mt-16 max-w-3xl px-6">
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-extrabold uppercase tracking-wide"
                    >
                        Our <span className="text-[#E3002A]">Challenges</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.9, delay: 0.3 }}
                        className="text-gray-200 mt-4 text-lg md:text-xl"
                    >
                        Join challenges and improve your fitness. Free challenges are automatically included in your program!
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.6 }}
                        className="mt-8"
                    >
                        <a
                            href="#challenges"
                            className="px-8 py-3 bg-[#E3002A] text-white font-semibold rounded-full shadow-lg hover:bg-[#ff0033] transition-all duration-300"
                        >
                            Explore Challenges
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Filter Buttons */}
            <div className="flex justify-center gap-4 mt-12 mb-10">
                {["all", "free", "paid"].map((f) => (
                    <button
                        key={f}
                        onClick={() => { setFilter(f); setCurrentPage(1); }}
                        className={`px-5 py-2 rounded-full font-semibold transition-all ${filter === f ? "bg-[#E3002A] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Challenges Grid */}
            <div id="challenges" className="grid gap-10 mb-10 mx-6 md:grid-cols-2 lg:grid-cols-3">
                {currentChallenges.map((ch) => (
                    <motion.div
                        key={ch._id || ch.id}
                        whileHover={{ y: -6, scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 cursor-pointer"
                        onClick={() => setSelectedChallenge(ch)}
                    >
                        <div className="relative h-56">
                            <img
                                src={ch.images?.[0] || "/challenges-placeholder.jpg"}
                                alt={ch.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-70"></div>
                            <span className="absolute top-4 left-4 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-md bg-[#E3002A]">
                                {ch.free ? "Free" : `₹${ch.price}`}
                            </span>
                        </div>
                        <div className="p-6 space-y-3">
                            <h2 className="text-2xl font-bold">{ch.name}</h2>
                            <p className="text-gray-700 text-sm">{ch.description}</p>
                            <div className="flex items-center gap-2 text-gray-700 text-sm">
                                <CalendarDays size={16} className="text-[#E3002A]" /> {ch.duration}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                                <User size={14} /> {ch.trainer}
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={(e) => { e.stopPropagation(); handleAddToCart(ch); }}
                                className={`w-full py-3 mt-4 rounded-xl font-semibold text-white text-lg shadow-md transition-all duration-300
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#E3002A] hover:bg-red-700 hover:shadow-lg"
                                    }`}
                            >
                                "Add to Cart"
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-3 mb-20">
                <button
                    onClick={prevPage}
                    className={`p-2 rounded-full border flex items-center justify-center ${currentPage === 1 ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center font-semibold ${currentPage === i + 1 ? "bg-red-600 text-white border-red-600" : "bg-white text-black border-gray-300 hover:bg-red-600 hover:text-white"
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    onClick={nextPage}
                    className={`p-2 rounded-full border flex items-center justify-center ${currentPage === totalPages ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                        }`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Challenge Modal */}
            {selectedChallenge && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setSelectedChallenge(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl"
                        >
                            ✕
                        </button>
                        <img
                            src={selectedChallenge.images?.[0] || "/challenges-placeholder.jpg"}
                            alt={selectedChallenge.name}
                            className="w-full h-64 object-cover rounded-xl mb-4"
                        />
                        <h2 className="text-2xl font-bold mb-2">{selectedChallenge.name}</h2>
                        <p className="text-gray-700 mb-4">{selectedChallenge.description}</p>

                        <div className="flex flex-wrap gap-2 text-gray-600 text-sm mb-4">
                            <span className="flex items-center gap-1"><User size={16} /> {selectedChallenge.trainer}</span>
                            <span className="flex items-center gap-1"><CalendarDays size={16} /> {selectedChallenge.duration}</span>
                            <span className="flex items-center gap-1">Difficulty: {selectedChallenge.difficulty}</span>
                            <span className="flex items-center gap-1">Category: {selectedChallenge.categories}</span>
                        </div>

                        <div className="mb-4">
                            <span
                                className={`px-4 py-1 rounded-full font-semibold text-white ${selectedChallenge.includedInProgram
                                    ? "bg-green-600"
                                    : selectedChallenge.free
                                        ? "bg-blue-600"
                                        : "bg-[#E3002A]"
                                    }`}
                            >
                                {selectedChallenge.includedInProgram
                                    ? "Included"
                                    : selectedChallenge.free
                                        ? "Free"
                                        : `₹${selectedChallenge.price}`}
                            </span>
                        </div>

                        <button
                            onClick={() => { handleAddToCart(selectedChallenge); setSelectedChallenge(null); }}
                            disabled={selectedChallenge.includedInProgram}
                            className={`w-full py-3 rounded-xl font-semibold text-white text-lg shadow-md transition-all duration-300 ${selectedChallenge.includedInProgram
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#E3002A] hover:bg-red-700 hover:shadow-lg"
                                }`}
                        >
                            {selectedChallenge.includedInProgram ? "Included" : "Add to Cart"}
                        </button>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            <ToastContainer
                position="top-right"
                autoClose={2500}
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

export default ChallengesPage;
