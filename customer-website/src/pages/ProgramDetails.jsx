// src/pages/ProgramDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import {
    Dumbbell,
    HeartPulse,
    Flame,
    Apple,
    Users,
    Timer,
    BarChart3,
    CheckCircle,
    ShoppingBag,
    ChevronRight,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const ProgramDetails = () => {
    const { id } = useParams();
    const [program, setProgram] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useShop();

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                // Fetch single program
                const { data } = await axios.get(`${API_URL}/api/programs/${id}`);

                const priceNumber = Number(data.price || 0);
                const safeProgram = {
                    ...data,
                    id: data.id || data._id,
                    title: data.title || "Untitled Program",
                    category: data.category || "Training",
                    difficulty: data.difficulty || "Beginner",
                    duration: data.duration || "30-45 min",
                    displayPrice: priceNumber > 0 ? `₹${priceNumber.toLocaleString('en-IN')}` : "Free",
                    overview: data.overview || data.desc || "No overview available",
                    trainingType: data.trainingType || "-",
                    focus: data.focus || "-",
                    equipment:
                        Array.isArray(data.equipment)
                            ? data.equipment.join(", ")
                            : typeof data.equipment === "string"
                                ? data.equipment
                                : "-", banner: data.banner || data.thumbnail || "https://via.placeholder.com/1200x675?text=No+Image",
                    image: data.banner || data.thumbnail || "https://via.placeholder.com/1200x675?text=No+Image",
                    trainerName: data.trainerName || "Self-Guided",
                };

                setProgram(safeProgram);

                // Fetch all programs to find related ones
                const { data: all } = await axios.get(`${API_URL}/api/programs`);
                const relatedPrograms = all
                    .filter((p) => p._id.toString() !== id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4)
                    .map((p) => ({
                        ...p,
                        _id: p._id, // keep Mongo _id
                        id: p.id || p._id, // optional, for internal use
                        title: p.title || "Untitled",
                        duration: p.duration || "30-45 min",
                        banner: p.banner || p.thumbnail || "https://via.placeholder.com/400x225",
                        trainerName: p.trainerName || "FitTrack Trainer",
                        difficulty: p.difficulty || "Beginner",
                        category: p.category || "Training",
                        displayPrice: p.price > 0 ? `₹${p.price.toLocaleString('en-IN')}` : "Free",
                    }));

                setRelated(relatedPrograms);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to fetch program");
                setLoading(false);
            }
        };

        fetchProgram();
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = (program) => {
        const cartItem = {
            id: program.id,
             type: "program",
            title: program.title || "Untitled Program",
            desc: program.overview?.slice(0, 150) + "..." || "No description",
            image: program.banner || program.thumbnail || "/placeholder.jpg",
            price: Number(program.price) || 0,
            duration: program.duration || "30-45 min",
            difficulty: program.difficulty || "Beginner",
            category: program.category || "Training",
            trainerName: program.trainerName || "Self-Guided",
            quantity: 1,
        };
        addToCart(cartItem);
    };


    if (loading)
        return <p className="text-center py-20 text-gray-500">Loading program...</p>;

    if (error)
        return <p className="text-center py-20 text-red-500">{error}</p>;

    if (!program)
        return <p className="text-center py-20 text-gray-600">Program not found.</p>;

    return (
        <div className="bg-white text-black">
            {/* ---------- HERO BANNER ---------- */}
            <section className="relative text-white py-20 text-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        alt={program.title}
                        src={program.banner}
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#E3002A]/60 to-black/90" />
                </div>

                {/* Motion Icons */}
                <motion.div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
                    {[
                        { icon: <Dumbbell size={40} />, x: "8%", y: "25%", delay: 0 },
                        { icon: <HeartPulse size={34} />, x: "85%", y: "40%", delay: 1 },
                        { icon: <Flame size={30} />, x: "20%", y: "75%", delay: 1.5 },
                        { icon: <Apple size={28} />, x: "70%", y: "65%", delay: 2 },
                        { icon: <Users size={38} />, x: "50%", y: "20%", delay: 0.5 },
                        { icon: <Timer size={32} />, x: "60%", y: "15%", delay: 2.5 },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            style={{ position: "absolute", left: item.x, top: item.y }}
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: [0, -10, 0] }}
                            transition={{ duration: 3, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
                            className="text-white/70 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
                        >
                            {item.icon}
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-20 max-w-4xl mx-auto px-6"
                >
                    <h1 className="text-5xl md:text-6xl mt-17 font-extrabold mb-6 uppercase tracking-[0.15em] drop-shadow-xl">
                        {program.title}
                    </h1>

                    <div className="flex justify-center items-center gap-3 text-gray-300 text-base md:text-lg mb-10 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Timer className="text-gray-200" size={18} /> {program.duration}
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="text-gray-200" size={18} /> {program.difficulty}
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-2">
                            <HeartPulse className="text-gray-200" size={18} /> {program.category}
                        </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                        <Link
                            to="#join"
                            className="inline-block -mt-5 px-9 py-4 bg-[#E3002A] hover:bg-[#ff1e3d] text-white font-semibold rounded-full shadow-[0_6px_20px_rgba(227,0,42,0.5)] transition-all duration-300"
                        >
                            Join Now
                        </Link>
                    </motion.div>
                </motion.div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-transparent to-transparent" />
            </section>

            {/* ---------- DETAILS SECTION ---------- */}
            <section id="join" className="max-w-7xl mx-auto pt-20 pb-24 px-6 md:px-10">
                <div className="grid md:grid-cols-3 gap-12">
                    {/* LEFT CONTENT */}
                    <div className="md:col-span-2 space-y-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="overflow-hidden rounded-3xl shadow-2xl border border-gray-200"
                        >
                            <img
                                src={program.banner}
                                alt={program.title}
                                className="w-full h-[360px] md:h-[400px] object-cover object-center"
                            />
                        </motion.div>

                        <div>
                            <h2 className="text-3xl font-bold text-[#E3002A] mb-4">Program Overview</h2>
                            <p className="text-gray-700 leading-relaxed text-lg">{program.overview}</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6 text-gray-700">
                            <Detail icon={<Timer />} label="Duration" value={program.duration} />
                            <Detail icon={<BarChart3 />} label="Difficulty" value={program.difficulty} />
                            <Detail icon={<Dumbbell />} label="Training Type" value={program.trainingType} />
                            <Detail icon={<Apple />} label="Focus" value={program.focus} />
                            <Detail icon={<Users />} label="Equipment" value={program.equipment} />
                            <Detail icon={<Flame />} label="Category" value={program.category} />
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 h-fit md:sticky top-24">
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">Join this Program</h3>
                        <p className="text-3xl font-bold text-[#E3002A] mb-6">{program.displayPrice}</p>

                        <button
                            onClick={() => handleAddToCart(program)}
                            className="w-full bg-[#E3002A] hover:bg-[#ff1e3d] text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition duration-300"
                        >
                            <ShoppingBag /> Add To Bag
                        </button>

                        <div className="mt-6 space-y-2 text-gray-600 text-sm">
                            <Feature text="Certified Trainers" />
                            <Feature text="Flexible Schedule" />
                            <Feature text="Online & Offline Access" />
                        </div>
                    </div>
                </div>

                {/* ---------- RELATED PROGRAMS ---------- */}
                <div className="mt-24">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-[#E3002A] text-center">
                        You May Also Like
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {related.map((p) => (
                            <motion.div
                                key={p.id}
                                whileHover={{ y: -8, scale: 1.03 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-[0_15px_30px_rgba(227,0,42,0.15)] transition-all duration-300"
                            >
                                <div className="relative overflow-hidden rounded-t-3xl">
                                    <img
                                        src={p.banner}
                                        alt={p.title}
                                        className="h-52 w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                                <div className="p-5 flex flex-col justify-between h-56">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 text-lg md:text-xl mb-2 truncate">
                                            {p.title}
                                        </h4>

                                        <div className="flex flex-col gap-2 text-gray-500 text-sm mb-3">
                                            <div className="flex items-center gap-2">
                                                <Timer className="text-[#E3002A]" size={16} />
                                                <span>Duration: {p.duration || "45–60 min"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="text-[#E3002A]" size={16} />
                                                <span>Trainer: {p.trainerName || "FitTrack Trainer"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BarChart3 className="text-[#E3002A]" size={16} />
                                                <span>Difficulty: {p.difficulty || "Beginner"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/program/${p._id}`}
                                        className=" inline-flex items-center justify-center gap-1 text-white bg-[#E3002A] hover:bg-[#ff1e3d] font-medium py-2 px-4 rounded-full text-sm transition-colors duration-300"
                                    >
                                        View Details <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- TOAST ---------- */}
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

// ---------- REUSABLE SUB COMPONENTS ----------
const Detail = ({ icon, label, value }) => (
    <div>
        <h4 className="font-semibold flex items-center gap-2 text-gray-800 mb-1">
            <span className="text-[#E3002A]">{icon}</span> {label}
        </h4>
        <p className="text-gray-600">{value}</p>
    </div>
);

const Feature = ({ text }) => (
    <div className="flex items-center gap-2">
        <CheckCircle className="text-green-500" size={18} /> {text}
    </div>
);

export default ProgramDetails;
