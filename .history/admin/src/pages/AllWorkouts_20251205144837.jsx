// src/pages/AllWorkouts.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Edit, Trash2, Eye, X, ChevronDown, Plus, Trash2 as TrashSmall } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ITEMS_PER_PAGE = 6;

const StatusToggle = ({ status, onToggle }) => {
    const isActive = status?.toLowerCase() === "active";
    return (
        <button
            onClick={onToggle}
            className={`relative inline-flex items-center h-7 w-14 rounded-full transition ${isActive ? "bg-green-500" : "bg-gray-300"}`}
        >
            <span className={`absolute w-6 h-6 bg-white rounded-full shadow transform transition ${isActive ? "translate-x-7" : "translate-x-1"}`}></span>
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
    const [modalType, setModalType] = useState(""); // "view" | "edit"
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [editProgram, setEditProgram] = useState(null);

    // Helper: Normalize exercise
    const normalizeExercise = (ex) => ({
        id: ex?.id || Date.now(),
        title: ex?.title || "",
        type: ex?.type || "time",
        time: ex?.time ?? 30,
        reps: ex?.reps ?? 12,
        sets: ex?.sets ?? 3,
        notes: ex?.notes || "",
        section: ex?.section || "Workout",
        thumbnail: ex?.thumbnail || null,
    });

    // Helper: Normalize day
    const normalizeDay = (day, index) => ({
        id: day?.id || Date.now() + index,
        title: day?.title || `Day ${index + 1}`,
        exercises: (day?.exercises || []).filter(ex => ex && typeof ex === "object").map(normalizeExercise),
    });

    // Fetch all programs
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

    // Filtering + Pagination
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

    // Open Modal
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
                    equipment: data.equipment || "",
                    totalDays: data.totalDays || (data.days?.length || 0),
                    caloriesBurned: data.caloriesBurned || 0,
                    plans: data.plans || [],
                    thumbnail: data.thumbnail ? { url: data.thumbnail } : null,
                    days: (data.days || []).map(day => ({
                        id: day.id || Date.now(),
                        title: day.title || `Day ${day.day || 1}`,
                        exercises: (day.exercises || []).map(ex => ({
                            id: ex.id,
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

    // Save Edited Program
    const saveEdit = async () => {
        if (!editProgram) return;

        try {
            const formData = new FormData();
            const cleanData = {
                ...editProgram,
                days: editProgram.days.map(d => ({
                    ...d,
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
            toast.error("Failed to save changes");
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

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Workout Programs</h1>
                    <p className="text-gray-600">Manage and edit your training programs</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search programs..."
                    className="flex-1 px-5 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <div className="relative">
                    <button onClick={() => setDropdown(!dropdown)} className="px-6 py-3 border rounded-xl bg-white flex items-center gap-2">
                        {filterStatus} <ChevronDown size={18} />
                    </button>
                    {dropdown && (
                        <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-lg z-10">
                            {["All", "Active", "Inactive"].map(s => (
                                <button key={s} onClick={() => { setFilterStatus(s); setDropdown(false); setCurrentPage(1); }}
                                    className="block w-full text-left px-4 py-3 hover:bg-gray-100">
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[#e3002a] text-white">
                        <tr>
                            <th className="px-6 py-5 text-left">Program</th>
                            <th className="px-6 py-5 text-left">Type</th>
                            <th className="px-6 py-5 text-left">Level</th>
                            <th className="px-6 py-5 text-left">Duration</th>
                            <th className="px-6 py-5 text-left font-bold">Price</th>
                            <th className="px-6 py-5 text-left">Status</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-16 text-gray-500">No programs found</td></tr>
                        ) : (
                            paginated.map(w => (
                                <tr key={w.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-5 flex items-center gap-4">
                                        <img src={w.thumbnail} alt="" className="w-14 h-14 rounded-xl object-cover" onError={e => e.target.src = "/default-thumbnail.png"} />
                                        <div>
                                            <p className="font-semibold">{w.name}</p>
                                            <p className="text-xs text-gray-500">{w.days.length} days • {w.days.reduce((a, d) => a + d.exercises.length, 0)} exercises</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">{w.trainingType}</td>
                                    <td className="px-6 py-5"><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{w.level}</span></td>
                                    <td className="px-6 py-5">{w.duration}</td>
                                    <td className="px-6 py-5 font-bold">₹{w.price}</td>
                                    <td className="px-6 py-5"><StatusToggle status={w.status} onToggle={() => toggleStatus(w.id)} /></td>
                                    <td className="space-x-3 ">
                                        <button onClick={() => openModal("view", w)} className="text-gray-600 hover:text-gray-900"><Eye size={18} /></button>
                                        <button onClick={() => openModal("edit", w)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                        <button onClick={() => deleteWorkout(w.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                        <p className="text-sm text-gray-600">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredWorkouts.length)} of {filteredWorkouts.length}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">Prev</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i} onClick={() => setCurrentPage(i + 1)}
                                    className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? "bg-[#e3002a] text-white" : "border"}`}>
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {modalOpen && modalType === "edit" && editProgram && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center z-10">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                                Edit Program: <span className="text-[#e3002a]">{editProgram.title || "Untitled"}</span>
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <X size={24} className="text-gray-600" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <input
                                value={editProgram.title || ""}
                                onChange={e => setEditProgram(p => ({ ...p, title: e.target.value }))}
                                className="w-full text-3xl sm:text-4xl font-bold outline-none border-b border-gray-300 pb-2 focus:border-[#e3002a]"
                                placeholder="Program Title"
                            />

                            <textarea
                                value={editProgram.description || ""}
                                onChange={e => setEditProgram(p => ({ ...p, description: e.target.value }))}
                                className="w-full p-4 border rounded-2xl h-36 resize-none shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                                placeholder="Program Description"
                            />

                            <div className="flex flex-col gap-2">
                                <label className="font-semibold text-gray-700">Program Thumbnail</label>
                                {editProgram.thumbnail ? (
                                    <img src={editProgram.thumbnail.url || editProgram.thumbnail} className="w-64 h-40 object-cover rounded-xl shadow" alt="Program" />
                                ) : (
                                    <span className="text-gray-400">No Image</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setEditProgram(p => ({
                                        ...p,
                                        thumbnail: { file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) }
                                    }))}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <input value={editProgram.duration || ""} onChange={e => setEditProgram(p => ({ ...p, duration: e.target.value }))} className="p-3 border rounded-xl" placeholder="Duration" />
                                <select value={editProgram.level || "Beginner"} onChange={e => setEditProgram(p => ({ ...p, level: e.target.value }))} className="p-3 border rounded-xl">
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                                <div className="flex items-center border rounded-xl">
                                    <span className="px-4 text-xl font-bold text-gray-700">₹</span>
                                    <input type="number" value={editProgram.price || 0} onChange={e => setEditProgram(p => ({ ...p, price: Number(e.target.value) || 0 }))} className="flex-1 p-3 outline-none" placeholder="Price" />
                                </div>
                                <input value={editProgram.trainerName || ""} onChange={e => setEditProgram(p => ({ ...p, trainerName: e.target.value }))} className="p-3 border rounded-xl" placeholder="Trainer Name" />
                                <input value={editProgram.focus || ""} onChange={e => setEditProgram(p => ({ ...p, focus: e.target.value }))} className="p-3 border rounded-xl" placeholder="Focus" />
                                <input type="number" value={editProgram.caloriesBurned || 0} onChange={e => setEditProgram(p => ({ ...p, caloriesBurned: Number(e.target.value) }))} className="p-3  border rounded-xl" placeholder="Calories Burned" />

                                {/* Equipment - Multiple Selection */}
                                <div className="col-span-1 lg:col-span-2">
                                    <label className="font-semibold text-gray-700">Equipment (Multiple)</label>

                                    <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                        {editProgram.equipment?.map((eq, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: "#e3002a" }}>
                                                {eq}
                                                <button onClick={() => setEditProgram(p => ({ ...p, equipment: p.equipment.filter((_, i) => i !== idx) }))} className="hover:bg-white/20 rounded-full p-0.5">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        {(!editProgram.equipment || editProgram.equipment.length === 0) && (
                                            <p className="text-gray-400 text-xs">No equipment selected</p>
                                        )}
                                    </div>

                                    <select
                                        value=""
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val && !editProgram.equipment?.includes(val)) {
                                                setEditProgram(p => ({ ...p, equipment: [...(p.equipment || []), val] }));
                                            }
                                            e.target.value = "";
                                        }}
                                        className="w-full p-3 border rounded-xl focus:ring-1 focus:ring-[#e3002a] outline-none"
                                    >
                                        <option value="" disabled>Add Equipment...</option>
                                        {["None", "Dumbbells", "Kettlebells", "Barbell", "Resistance Bands", "Pull-up Bar", "Bench", "Yoga Mat", "Jump Rope", "Machines", "Bodyweight Only"]
                                            .filter(opt => !editProgram.equipment?.includes(opt))
                                            .map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-semibold text-gray-700">Plans</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {["Basic", "Premium", "Pro"].map(plan => (
                                            <button
                                                key={plan}
                                                type="button"
                                                onClick={() => setEditProgram(p => {
                                                    const plans = p.plans || [];
                                                    return {
                                                        ...p,
                                                        plans: plans.includes(plan) ? plans.filter(pl => pl !== plan) : [...plans, plan]
                                                    };
                                                })}
                                                className={`px-4 py-2 rounded-full border ${editProgram.plans?.includes(plan) ? "bg-[#e3002a] text-white border-[#e3002a]" : "bg-white text-gray-700 border-gray-300"}`}
                                            >
                                                {plan}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Days & Exercises */}
                            {editProgram.days?.map((day, dayIdx) => (
                                <div key={day.id || dayIdx} className="border rounded-2xl p-6 bg-gray-50 shadow-sm space-y-6">
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
                                        <div key={ex.id || exIdx} className="bg-white rounded-xl p-6 border shadow-sm flex flex-col md:flex-row gap-6">
                                            <div className="w-full md:w-32 h-32 bg-gray-200 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden">
                                                {ex.thumbnail ? <img src={ex.thumbnail.url || ex.thumbnail} className="w-full h-full object-cover" alt="" /> : <span className="text-gray-400 text-xs">No Image</span>}
                                            </div>

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

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
                                                    <select
                                                        value={ex.section || "Workout"}
                                                        onChange={e => setEditProgram(p => ({
                                                            ...p,
                                                            days: p.days.map((d, i) => i === dayIdx ? {
                                                                ...d,
                                                                exercises: d.exercises.map((ee, j) => j === exIdx ? { ...ee, section: e.target.value } : ee)
                                                            } : d)
                                                        }))}
                                                        className="w-full p-3 border rounded-lg"
                                                    >
                                                        <option value="Warm-up">Warm-up</option>
                                                        <option value="Workout">Workout</option>
                                                        <option value="Cool-down">Cool-down</option>
                                                    </select>
                                                </div>

                                                <div className="flex gap-4 items-center flex-wrap">
                                                    <select
                                                        value={ex.type || "time"}
                                                        onChange={e => setEditProgram(p => ({
                                                            ...p,
                                                            days: p.days.map((d, i) => i === dayIdx ? {
                                                                ...d,
                                                                exercises: d.exercises.map((ee, j) => j === exIdx ? { ...ee, type: e.target.value } : ee)
                                                            } : d)
                                                        }))}
                                                        className="p-3 border rounded-lg"
                                                    >
                                                        <option value="time">Time</option>
                                                        <option value="reps">Reps</option>
                                                    </select>

                                                    {(ex.type || "time") === "time" ? (
                                                        <input type="number" value={ex.time || ""} onChange={e => setEditProgram(p => ({
                                                            ...p,
                                                            days: p.days.map((d, i) => i === dayIdx ? {
                                                                ...d,
                                                                exercises: d.exercises.map((ee, j) => j === exIdx ? { ...ee, time: Number(e.target.value) || 0 } : ee)
                                                            } : d)
                                                        }))} placeholder="Seconds" className="p-3 border rounded-lg w-32" />
                                                    ) : (
                                                        <>
                                                            <input type="number" value={ex.reps || ""} onChange={e => setEditProgram(p => ({
                                                                ...p,
                                                                days: p.days.map((d, i) => i === dayIdx ? {
                                                                    ...d,
                                                                    exercises: d.exercises.map((ee, j) => j === exIdx ? { ...ee, reps: Number(e.target.value) || 0 } : ee)
                                                                } : d)
                                                            }))} placeholder="Reps" className="p-3 border rounded-lg w-24" />
                                                            <input type="number" value={ex.sets || ""} onChange={e => setEditProgram(p => ({
                                                                ...p,
                                                                days: p.days.map((d, i) => i === dayIdx ? {
                                                                    ...d,
                                                                    exercises: d.exercises.map((ee, j) => j === exIdx ? { ...ee, sets: Number(e.target.value) || 0 } : ee)
                                                                } : d)
                                                            }))} placeholder="Sets" className="p-3 border rounded-lg w-24" />
                                                        </>
                                                    )}
                                                </div>

                                                <textarea
                                                    value={ex.notes || ""}
                                                    onChange={e => setEditProgram(p => ({
                                                        ...p,
                                                        days: p.days.map((d, i) => i === dayIdx ? {
                                                            ...d,
                                                            exercises: d.exercises.map((ee, j) => j === exIdx ? { ...ee, notes: e.target.value } : ee)
                                                        } : d)
                                                    }))}
                                                    placeholder="Notes / Cues"
                                                    className="w-full p-3 border rounded-lg h-24 resize-none"
                                                />

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => setEditProgram(p => ({
                                                        ...p,
                                                        days: p.days.map((d, i) => i === dayIdx ? {
                                                            ...d,
                                                            exercises: d.exercises.map((ee, j) => j === exIdx ? {
                                                                ...ee,
                                                                thumbnail: { file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) }
                                                            } : ee)
                                                        } : d)
                                                    }))}
                                                    className="text-sm"
                                                />
                                            </div>

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

                            <div className="flex flex-col sm:flex-row justify-between pt-8 gap-4">
                                <button
                                    onClick={() => setEditProgram(p => ({
                                        ...p,
                                        days: [...p.days, { id: Date.now(), title: `Day ${p.days.length + 1}`, exercises: [] }]
                                    }))}
                                    className="px-6 py-3 border rounded-xl flex items-center gap-2 hover:bg-gray-50 font-medium"
                                >
                                    <Plus size={18} /> Add Day
                                </button>
                                <button onClick={saveEdit} className="px-8 py-3 bg-[#e3002a] text-white rounded-xl font-bold hover:bg-[#c90024]">
                                    Save All Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {modalOpen && modalType === "view" && selectedWorkout && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold">{selectedWorkout.name}</h2>
                            <button onClick={closeModal}><X size={24} /></button>
                        </div>
                        <img src={selectedWorkout.thumbnail} className="w-full h-64 object-cover rounded-xl mb-6" onError={e => e.target.src = "/default-thumbnail.png"} alt={selectedWorkout.name} />
                        <div className="grid grid-cols-2 gap-4 text-gray-700">
                            <p><strong>Price:</strong> ₹{selectedWorkout.price}</p>
                            <p><strong>Level:</strong> {selectedWorkout.level}</p>
                            <p><strong>Duration:</strong> {selectedWorkout.duration}</p>
                            <p><strong>Type:</strong> {selectedWorkout.trainingType}</p>
                        </div>
                        <p className="mt-6 text-gray-600">{selectedWorkout.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
}