// src/pages/AllWorkouts.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Edit, Trash2, Eye, X, ChevronDown, Plus, Trash2 as TrashSmall } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from 'uuid';

const ITEMS_PER_PAGE = 6;

const StatusToggle = ({ status, onToggle }) => {
    const isActive = status?.toLowerCase() === "active";

    return (
        <button
            onClick={onToggle}
            aria-pressed={isActive}
            className={`relative inline-flex items-center h-7 w-14 rounded-full transition-colors duration-300 ${isActive ? "bg-green-500" : "bg-gray-300"
                }`}
        >
            <span
                className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${isActive ? "translate-x-7" : "translate-x-0"
                    }`}
            ></span>
        </button>
    );
};

export default function AllWorkouts() {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [dropdown, setDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [editProgram, setEditProgram] = useState(null);

    const normalizeExercise = (ex) => ({
        id: ex?.id || uuidv4(),
        title: ex?.title || "",
        type: ex?.type || "time",
        time: ex?.time ?? 30,
        reps: ex?.reps ?? 12,
        sets: ex?.sets ?? 3,
        notes: ex?.notes || "",
        section: ex?.section || "Workout",
        thumbnail: ex?.thumbnail || null,
    });

    const normalizeDay = (day, index) => ({
        id: day?.id || Date.now() + index,
        title: day?.title || `Day ${index + 1}`,
        exercises: (day?.exercises || []).filter(ex => ex && typeof ex === "object").map(normalizeExercise),
    });

    const fetchWorkouts = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/programs");
            const mapped = res.data.map(w => ({
                _id: w._id,
                id: w.id,
                name: w.title || "Untitled",
                thumbnail: w.thumbnail || "/default-thumbnail.png",
                price: w.price || 0,
                level: w.level || "Beginner",
                duration: w.duration || "30 – 45 min",
                trainingType: w.trainingType || "Full Body",
                status: w.status || "Active",
                description: w.description || "",
                days: (w.days || []).map(normalizeDay),
            }));
            setWorkouts(mapped);
        } catch (err) {
            toast.error("Failed to load programs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkouts();
        const handler = () => fetchWorkouts();
        window.addEventListener("workoutSaved", handler);
        return () => window.removeEventListener("workoutSaved", handler);
    }, []);

    const filteredWorkouts = useMemo(() => {
        return workouts.filter(w => {
            const match = w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (w.description || "").toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = filterStatus === "All" || w.status === filterStatus;
            return match && statusMatch;
        });
    }, [workouts, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredWorkouts.length / ITEMS_PER_PAGE);
    const paginated = filteredWorkouts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const openModal = async (type, workout) => {
        setModalType(type);
        setSelectedWorkout(workout);

        if (type === "edit") {
            try {
                const res = await axios.get(`http://localhost:5000/api/programs/${workout.id}`);
                const data = res.data;

                setEditProgram({
                    id: data.id,
                    title: data.title || "Untitled",
                    description: data.desc || "",
                    price: data.price || 0,
                    level: data.difficulty || "Beginner",
                    duration: data.duration || "30 – 45 min",
                    trainingType: data.trainingType || "Full Body",
                    trainerName: data.trainerName || "",
                    focus: data.focus || "",
                    equipment: data.equipment || [],
                    totalDays: data.totalDays || (data.days?.length || 0),
                    caloriesBurned: data.caloriesBurned || 0,
                    plans: data.plans || [],
                    thumbnail: data.thumbnail ? { url: data.thumbnail } : null,
                    days: (data.days || []).map(day => ({
                        id: day.id || uuidv4(),
                        title: day.title || `Day ${day.day || 1}`,
                        exercises: (day.exercises || []).map(ex => ({
                            id: ex.id || uuidv4(),
                            title: ex.title,
                            type: ex.type,
                            time: ex.time,
                            reps: ex.reps,
                            sets: ex.sets,
                            notes: ex.description || "",
                            section: ex.section || "Workout",
                            thumbnail: ex.thumbnail ? { url: ex.thumbnail } : null,
                        }))
                    }))
                });
            } catch (err) {
                toast.error("Failed to load full program");
            }
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalType("");
        setSelectedWorkout(null);
        setEditProgram(null);
    };

    // YE SABSE IMPORTANT FIX – cleanData mein desc field daala
    const saveEdit = async () => {
        if (!editProgram) return;

        try {
            const formData = new FormData();

            const cleanData = {
                id: editProgram.id,
                title: editProgram.title,
                desc: editProgram.description,  // ← Yahi main fix tha!
                price: editProgram.price,
                level: editProgram.level,
                duration: editProgram.duration,
                trainingType: editProgram.trainingType,
                trainerName: editProgram.trainerName,
                focus: editProgram.focus,
                equipment: editProgram.equipment || [],
                caloriesBurned: editProgram.caloriesBurned || 0,
                plans: editProgram.plans || [],
                days: editProgram.days.map(d => ({
                    title: d.title,
                    exercises: d.exercises.map(ex => ({
                        id: ex.id,
                        title: ex.title,
                        type: ex.type,
                        time: ex.time || 0,
                        reps: ex.reps || 0,
                        sets: ex.sets || 0,
                        notes: ex.notes || "",
                        section: ex.section || "Workout",
                    }))
                }))
            };

            formData.append("program", JSON.stringify(cleanData));

            if (editProgram.thumbnail?.file) {
                formData.append("thumbnail", editProgram.thumbnail.file);
            }

            editProgram.days.forEach(day => {
                day.exercises.forEach(ex => {
                    if (ex.thumbnail?.file) {
                        formData.append(`exercise-${ex.id}`, ex.thumbnail.file);
                    }
                });
            });

            await axios.put(`http://localhost:5000/api/programs/${editProgram.id}`, formData);

            toast.success("Program updated successfully!");
            fetchWorkouts();
            closeModal();
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Failed to save: " + (err.response?.data?.message || err.message));
        }
    };

    const deleteWorkout = async (id) => {
        if (!window.confirm("Delete this program permanently?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/programs/${id}`);
            setWorkouts(prev => prev.filter(w => w.id !== id));
            toast.success("Program deleted");
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const toggleStatus = async (id) => {
        const workout = workouts.find(w => w.id === id);
        const newStatus = workout.status === "Active" ? "Inactive" : "Active";
        try {
            await axios.patch(`http://localhost:5000/api/programs/${id}/status`, { status: newStatus });
            setWorkouts(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    if (loading) return <div className="p-10 text-center text-xl">Loading programs...</div>;

    return (
        <div className="p-6 bg-white rounded-lg min-h-screen">
            <ToastContainer theme="dark" position="top-right" />

            {/* ... baaki sab same hai ... */}

            {/* Edit Modal ke andar Days & Exercises – dayIdx, exIdx add kiya */}
            {modalOpen && modalType === "edit" && editProgram && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                        {/* Header same */}

                        <div className="p-8 space-y-8">
                            {/* Title, Description, Thumbnail, Fields same */}

                            {/* Days & Exercises */}
                            {editProgram.days?.map((day, dayIdx) => (
                                <div key={day.id} className="border rounded-2xl p-6 bg-gray-50 shadow-sm space-y-6">
                                    <input
                                        value={day.title || ""}
                                        onChange={e => setEditProgram(p => ({
                                            ...p,
                                            days: p.days.map((d, i) => i === dayIdx ? { ...d, title: e.target.value } : d)
                                        }))}
                                        className="text-xl font-semibold w-full outline-none bg-transparent border-b border-gray-300 pb-2 focus:border-[#e3002a]"
                                        placeholder="Day Title"
                                    />

                                    {day.exercises?.map((ex, exIdx) => (
                                        <div key={ex.id} className="bg-white rounded-xl p-6 border shadow-sm flex flex-col md:flex-row gap-6">
                                            {/* Thumbnail preview same */}

                                            <div className="flex-1 space-y-4">
                                                <input
                                                    value={ex.title || ""}
                                                    onChange={e => setEditProgram(p => ({
                                                        ...p,
                                                        days: p.days.map((d, i) => i === dayIdx ? {
                                                            ...d,
                                                            exercises: d.exercises.map((ee, j) => j === exIdx ? { ...ee, title: e.target.value } : ee)
                                                        } : d)
                                                    }))}
                                                    className="w-full p-3 border rounded-lg"
                                                    placeholder="Exercise Name"
                                                />

                                                {/* Section, Type, Time/Reps, Notes, File input sab same rahega – sirf exIdx use kar rahe hain ab */}

                                                <button
                                                    onClick={() => setEditProgram(p => ({
                                                        ...p,
                                                        days: p.days.map((d, i) => i === dayIdx ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) } : d)
                                                    }))}
                                                    className="text-red-600 hover:bg-red-50 p-3 rounded-lg self-start"
                                                >
                                                    <TrashSmall size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => setEditProgram(p => ({
                                            ...p,
                                            days: p.days.map((d, i) => i === dayIdx ? { ...d, exercises: [...d.exercises, normalizeExercise({})] } : d)
                                        }))}
                                        className="text-[#e3002a] flex items-center gap-2 font-semibold hover:text-[#c90024]"
                                    >
                                        <Plus size={18} /> Add Exercise
                                    </button>
                                </div>
                            ))}

                            {/* Add Day and Save button same */}
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal same */}
        </div>
    );
}