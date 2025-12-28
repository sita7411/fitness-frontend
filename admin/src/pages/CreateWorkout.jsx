import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Trash2,
    X,
    Image,
    ArrowUpRight,
    Download,
    ChevronDown,
    ChevronUp,
    Check,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminAuth } from "../context/AdminAuthContext";
const THEME = "#e3002a";
const LIGHT_BORDER = "#e5e7eb";
const LIGHT_SHADOW = "0 4px 16px rgba(0,0,0,0.05)";
const uid = () => Math.random().toString(36).slice(2, 9);
const MEMBERSHIP_PLANS = ["Basic", "Premium", "Pro"];

// ------------------ Dropdown ------------------
const Dropdown = ({ options = [], value, onChange, className = "" }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const onDoc = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("click", onDoc);
        return () => document.removeEventListener("click", onDoc);
    }, []);

    return (
        <div className={`relative ${className}`} ref={ref}>
            <button
                onClick={() => setOpen((s) => !s)}
                className="w-full px-3 py-2 rounded-xl border bg-white flex items-center justify-between text-sm shadow-sm"
                style={{ borderColor: LIGHT_BORDER }}
            >
                <span className="truncate">{value}</span>
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute z-30 mt-2 w-full bg-white rounded-xl border overflow-hidden shadow-lg"
                        style={{ borderColor: LIGHT_BORDER }}
                    >
                        {options.map((opt) => (
                            <div
                                key={opt}
                                onClick={() => {
                                    onChange(opt);
                                    setOpen(false);
                                }}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-sm"
                            >
                                <span className="truncate">{opt}</span>
                                {opt === value && <Check size={14} color={THEME} />}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ------------------ DayCard ------------------
const DayCard = ({
    day,
    index,
    totalDays,
    onAddExercise,
    onRemoveDay,
    onUpdateDay,
    onRemoveExercise,
    onUpdateExercise,
}) => {
    const [open, setOpen] = useState(true);

    return (
        <div
            className="rounded-2xl bg-white border w-full overflow-hidden"
            style={{ borderColor: LIGHT_BORDER, boxShadow: LIGHT_SHADOW }}
        >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setOpen((s) => !s)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white hover:bg-gray-100 transition"
                        style={{ borderColor: LIGHT_BORDER }}
                    >
                        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    <div>
                        <input
                            value={day.title}
                            onChange={(e) => onUpdateDay(day.id, { title: e.target.value })}
                            className="text-[20px] font-semibold outline-none text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">{day.exercises.length} exercises</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onAddExercise(day.id)}
                        className="px-4 py-2 rounded-xl border text-sm flex items-center gap-2 hover:bg-gray-100 transition font-medium"
                        style={{ borderColor: LIGHT_BORDER }}
                    >
                        <Plus size={14} /> Add Exercise
                    </button>

                    {totalDays > 1 && (
                        <button
                            onClick={() => onRemoveDay(day.id)}
                            className="text-sm text-red-600 flex items-center gap-1 font-medium"
                        >
                            <Trash2 size={14} /> Remove
                        </button>
                    )}
                </div>
            </div>

            {/* Accordion Content */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-5 pt-4 bg-white border-t"
                        style={{ borderColor: LIGHT_BORDER }}
                    >
                        <div className="space-y-4">
                            {day.exercises.map((ex) => {
                                const thumbUrl =
                                    ex.thumbnail?.url || (ex.thumbnail?.file && URL.createObjectURL(ex.thumbnail.file));

                                return (
                                    <div
                                        key={ex.id}
                                        className="flex items-start gap-5 bg-white rounded-xl p-4 border transition-all"
                                        style={{ borderColor: LIGHT_BORDER, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
                                    >
                                        {/* Thumbnail */}
                                        <div
                                            className="w-28 h-24 rounded-xl overflow-hidden border bg-gray-50 flex-shrink-0"
                                            style={{ borderColor: LIGHT_BORDER }}
                                        >
                                            {thumbUrl ? (
                                                <img
                                                    src={thumbUrl}
                                                    alt={ex.title || "Exercise Thumbnail"}
                                                    onError={(e) => {
                                                        e.target.src = "https://via.placeholder.com/1200x675?text=Image+Not+Available";
                                                    }}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <label className="cursor-pointer text-gray-400 flex flex-col items-center justify-center h-full w-full">
                                                    <div className="p-3 rounded-lg border border-dashed border-gray-300">
                                                        <Image size={32} />
                                                    </div>
                                                    <span className="text-xs mt-3">Upload 1200×675</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        hidden
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                onUpdateExercise(day.id, ex.id, {
                                                                    thumbnail: { file, url: URL.createObjectURL(file) }
                                                                });
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {/* Fields */}
                                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
                                            <div className="lg:col-span-4">
                                                <input
                                                    placeholder="Exercise title"
                                                    value={ex.title}
                                                    onChange={(e) => onUpdateExercise(day.id, ex.id, { title: e.target.value })}
                                                    className="w-full p-2 rounded-xl border focus:ring-1"
                                                    style={{ borderColor: LIGHT_BORDER }}
                                                />
                                            </div>

                                            <Dropdown
                                                options={["time", "reps"]}
                                                value={ex.type}
                                                onChange={(v) => onUpdateExercise(day.id, ex.id, { type: v })}
                                            />
                                            {/* SECTION  */}
                                            <div className="lg:col-span-2">
                                                <Dropdown
                                                    options={["Warm-up", "Workout", "Cool-down"]}
                                                    value={ex.section || "Workout"}
                                                    onChange={(v) => onUpdateExercise(day.id, ex.id, { section: v })}
                                                />
                                            </div>
                                            {ex.type === "time" ? (
                                                <input
                                                    type="number"
                                                    placeholder="Time (sec)"
                                                    value={ex.time || ""}
                                                    onChange={(e) => onUpdateExercise(day.id, ex.id, { time: Number(e.target.value) })}
                                                    className="p-2 rounded-xl border"
                                                    style={{ borderColor: LIGHT_BORDER }}
                                                />
                                            ) : (
                                                <>
                                                    <input
                                                        type="number"
                                                        placeholder="Reps"
                                                        value={ex.reps || ""}
                                                        onChange={(e) => onUpdateExercise(day.id, ex.id, { reps: Number(e.target.value) })}
                                                        className="p-2 rounded-xl border"
                                                        style={{ borderColor: LIGHT_BORDER }}
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Sets"
                                                        value={ex.sets || ""}
                                                        onChange={(e) => onUpdateExercise(day.id, ex.id, { sets: Number(e.target.value) })}
                                                        className="p-2 rounded-xl border"
                                                        style={{ borderColor: LIGHT_BORDER }}
                                                    />
                                                </>
                                            )}

                                            <div className="lg:col-span-4">
                                                <textarea
                                                    value={ex.notes || ""}
                                                    onChange={(e) => onUpdateExercise(day.id, ex.id, { notes: e.target.value })}
                                                    className="w-full p-2 rounded-xl border h-20 resize-none"
                                                    style={{ borderColor: LIGHT_BORDER }}
                                                    placeholder="Notes / cues"
                                                />
                                            </div>

                                            <div className="lg:col-span-4 flex justify-end">
                                                <button
                                                    onClick={() => onRemoveExercise(day.id, ex.id)}
                                                    className="text-red-600 text-sm flex items-center gap-1"
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ------------------ Main Component ------------------
export default function CreateWorkout() {
    const { api } = useAdminAuth();
    const [workout, setWorkout] = useState(() => ({
        id: uid(),
        title: "",
        description: "",
        thumbnail: null,
        duration: "30 – 45 min",
        level: "Beginner",
        trainingType: "Full Body",
        focus: "General Fitness",
        equipment: [],
        price: 0,
        trainerName: "",
        caloriesBurned: 0,
        plans: [],

        days: [
            {
                id: uid(),
                title: "Day 1",
                exercises: [
                    { id: uid(), title: "", type: "time", time: 30, reps: 12, sets: 1, thumbnail: null, notes: "", section: "Workout" },
                ],
            },
        ],
    }));

    const update = (patch) => setWorkout((p) => ({ ...p, ...patch }));

    // --------------- Image Handling ----------------
    const handleMainImage = (file) =>
        update({ thumbnail: file ? { file, url: URL.createObjectURL(file) } : null });
    const removeMainImage = () => update({ thumbnail: null });

    // ----------------- Day / Exercise Handlers -----------------
    const addDay = () => {
        setWorkout((w) => {
            const newDay = {
                id: uid(),
                title: `Day ${w.days.length + 1}`,
                exercises: [
                    { id: uid(), title: "", type: "time", time: 30, reps: 12, sets: 1, thumbnail: null, notes: "" },
                ],
            };
            toast.info(`${newDay.title} added!`);
            return { ...w, days: [...w.days, newDay] };
        });
    };

    const removeDay = (dayId) => {
        setWorkout((w) => {
            const day = w.days.find((d) => d.id === dayId);
            toast.warn(`${day.title} removed!`);
            return { ...w, days: w.days.filter((d) => d.id !== dayId) };
        });
    };

    const updateDay = (dayId, patch) =>
        setWorkout((w) => ({ ...w, days: w.days.map((d) => (d.id === dayId ? { ...d, ...patch } : d)) }));

    const addExercise = (dayId) =>
        setWorkout((w) => ({
            ...w,
            days: w.days.map((d) =>
                d.id === dayId
                    ? {
                        ...d,
                        exercises: [
                            ...d.exercises,
                            { id: uid(), title: "", type: "time", time: 30, reps: 12, sets: 1, thumbnail: null, notes: "" },
                        ],
                    }
                    : d
            ),
        }));

    const removeExercise = (dayId, exId) =>
        setWorkout((w) => ({
            ...w,
            days: w.days.map((d) =>
                d.id === dayId ? { ...d, exercises: d.exercises.filter((ex) => ex.id !== exId) } : d
            ),
        }));

    const updateExercise = (dayId, exId, patch) =>
        setWorkout((w) => ({
            ...w,
            days: w.days.map((d) =>
                d.id === dayId
                    ? { ...d, exercises: d.exercises.map((ex) => (ex.id === exId ? { ...ex, ...patch } : ex)) }
                    : d
            ),
        }));

    const togglePlan = (plan) => {
        setWorkout((w) => {
            const updatedPlans = w.plans.includes(plan)
                ? w.plans.filter((p) => p !== plan)  // remove if already selected
                : [...w.plans, plan];                // add if not selected
            return { ...w, plans: updatedPlans };
        });
    };

    // --------------- Validation ----------------
    const validateWorkout = () => {
        if (!workout.title.trim()) return "Program title is required.";
        if (!workout.description.trim()) return "Program description is required.";
        if (!workout.days.length) return "At least one day is required.";

        for (let day of workout.days) {
            if (!day.title.trim()) return `Day title is required (Day ${day.id}).`;
            if (!day.exercises.length) return `${day.title} must have at least one exercise.`;
            for (let ex of day.exercises) {
                if (!ex.title.trim()) return `Exercise title is required in ${day.title}.`;
                if (!ex.type) return `Exercise type is required in ${day.title}.`;
                if (ex.type === "time" && (!ex.time || ex.time <= 0)) return `Time must be greater than 0 in ${ex.title}.`;
                if (ex.type === "reps" && (!ex.reps || ex.reps <= 0)) return `Reps must be greater than 0 in ${ex.title}.`;
                if (ex.type === "reps" && (!ex.sets || ex.sets <= 0)) return `Sets must be greater than 0 in ${ex.title}.`;
                if (!ex.notes.trim()) return `Notes are required in ${ex.title}.`;
            }
        }

        return null;
    };

    // --------------- Export JSON ----------------
    const exportJSON = () => {
        const cleanData = {
            ...workout,
            plans: workout.plans,
            thumbnail: workout.thumbnail ? { url: workout.thumbnail.url } : null,
            days: workout.days.map((day) => ({
                ...day,
                exercises: day.exercises.map((ex) => ({
                    ...ex,
                    thumbnail: ex.thumbnail ? { url: ex.thumbnail.url } : null,
                })),
            })),
        };

        const dataStr = JSON.stringify(cleanData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${workout.title.trim() || "workout-program"}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Program exported as JSON!");
    };

    // --------------- Save Program ----------------
    const handleSave = async () => {
  const error = validateWorkout();
  if (error) return toast.error(error);

  try {
    const formData = new FormData();

    // 1. Main thumbnail
    if (workout.thumbnail?.file) {
      formData.append("thumbnail", workout.thumbnail.file);
    }

    // 2. Exercise thumbnails — IMPORTANT: Use index-based naming (not id!)
    workout.days.forEach((day, dayIndex) => {
      day.exercises.forEach((ex, exIndex) => {
        if (ex.thumbnail?.file) {
          formData.append(`exercise_${dayIndex}_${exIndex}`, ex.thumbnail.file);
        }
      });
    });

    // 3. Clean program data (no frontend IDs, no file objects)
    const programData = {
      title: workout.title.trim(),
      description: workout.description.trim(),
      duration: workout.duration,
      level: workout.level,
      trainingType: workout.trainingType,
      focus: workout.focus,
      equipment: workout.equipment || [],
      price: Number(workout.price) || 0,
      trainerName: workout.trainerName?.trim() || "",
      caloriesBurned: Number(workout.caloriesBurned) || 0,
      plans: workout.plans || [],
      days: workout.days.map((day) => ({
        title: day.title.trim(),
        exercises: day.exercises.map((ex) => ({
          title: ex.title.trim() || "Untitled Exercise",
          type: ex.type || "time",
          time: ex.type === "time" ? Number(ex.time) || 30 : undefined,
          reps: ex.type === "reps" ? Number(ex.reps) || 12 : undefined,
          sets: ex.type === "reps" ? Number(ex.sets) || 3 : undefined,
          section: ex.section || "Workout",
          notes: ex.notes?.trim() || "",
        })),
      })),
    };

    formData.append("program", JSON.stringify(programData));

    const res = await api.post(`/api/programs`, formData);

    toast.success("Workout program saved successfully!");
    console.log("Saved:", res.data);


  } catch (err) {
    console.error("Save error:", err);
    const message = err.response?.data?.message || "Failed to save program";
    toast.error(message);
  }
};

    const totalExercises = useMemo(() => workout.days.reduce((s, d) => s + d.exercises.length, 0), [workout]);

    return (
        <div className="min-h-screen bg-white rounded-lg py-10 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Workout Program</h1>
                        <p className="text-gray-500 mt-1">Build multi-day professional training programs.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportJSON}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white shadow-sm text-sm hover:bg-gray-50"
                            style={{ borderColor: LIGHT_BORDER }}
                        >
                            <ArrowUpRight size={16} /> Export JSON
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-md"
                            style={{ background: THEME }}
                        >
                            <Download size={16} /> Save Program
                        </button>
                    </div>
                </div>

                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Cover Image */}
                    <div>
                        <label className="font-medium text-sm">Cover Image</label>
                        <div
                            className="mt-3 h-56 rounded-2xl border bg-white shadow-sm flex items-center justify-center relative overflow-hidden"
                            style={{ borderColor: LIGHT_BORDER }}
                        >
                            {workout.thumbnail ? (
                                <>
                                    <img
                                        src={workout.thumbnail.url}
                                        alt="Program cover"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={removeMainImage}
                                        className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <label className="cursor-pointer text-gray-400 flex flex-col items-center justify-center h-full w-full">
                                    <div className="p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                                        <Image size={40} />
                                    </div>
                                    <span className="text-sm mt-3 font-medium">Click to upload cover</span>
                                    <span className="text-xs text-gray-500">Recommended: 1200×675</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                update({ thumbnail: { file, url: URL.createObjectURL(file) } });
                                            }
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Right Inputs */}
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label className="font-medium text-sm">Program Title</label>
                            <input
                                value={workout.title}
                                onChange={(e) => update({ title: e.target.value })}
                                placeholder="Enter program title"
                                className="w-full mt-2 p-3 rounded-xl border focus:ring-1 outline-none"
                                style={{ borderColor: LIGHT_BORDER }}
                            />
                        </div>

                        <div>
                            <label className="font-medium text-sm">Description</label>
                            <textarea
                                value={workout.description}
                                onChange={(e) => update({ description: e.target.value })}
                                placeholder="Short description..."
                                className="w-full mt-2 p-3 rounded-xl border h-28"
                                style={{ borderColor: LIGHT_BORDER }}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ">
                            <div>
                                <label className="font-medium text-sm">Duration</label>
                                <Dropdown
                                    options={["15 – 30 min", "30 – 45 min", "45 – 60 min"]}
                                    value={workout.duration}
                                    onChange={(v) => update({ duration: v })}
                                />
                            </div>

                            <div>
                                <label className="font-medium text-sm">Level</label>
                                <Dropdown
                                    options={["Beginner", "Intermediate", "Advanced"]}
                                    value={workout.level}
                                    onChange={(v) => update({ level: v })}
                                />
                            </div>

                            <div>
                                <label className="font-medium text-sm">Training Type</label>
                                <Dropdown
                                    options={["Full Body", "Upper Body", "Lower Body", "Cardio", "Strength"]}
                                    value={workout.trainingType}
                                    onChange={(v) => update({ trainingType: v })}
                                />
                            </div>

                            <div>
                                <label className="font-medium text-sm">Focus</label>
                                <Dropdown
                                    options={["General Fitness", "Fat Loss", "Muscle Gain", "Endurance"]}
                                    value={workout.focus}
                                    onChange={(v) => update({ focus: v })}
                                />
                            </div>

                        </div>
                        {/* Equipment  */}
                        <div>
                            <label className="font-medium text-sm">Equipment </label>

                            {/* Selected Equipment Chips */}
                            <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                {workout.equipment.map((eq, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                                        style={{ backgroundColor: THEME }}
                                    >
                                        {eq}
                                        <button
                                            onClick={() => update({
                                                equipment: workout.equipment.filter((_, i) => i !== idx)
                                            })}
                                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}

                                {workout.equipment.length === 0 && (
                                    <p className="text-gray-400 text-xs">No equipment selected</p>
                                )}
                            </div>

                            {/* Dropdown to Add More */}
                            <Dropdown
                                options={[
                                    "None",
                                    "Dumbbells",
                                    "Kettlebells",
                                    "Barbell",
                                    "Resistance Bands",
                                    "Pull-up Bar",
                                    "Bench",
                                    "Yoga Mat",
                                    "Jump Rope",
                                    "Machines",
                                    "Bodyweight Only"
                                ].filter(opt => !workout.equipment.includes(opt))} // hide already selected
                                value="Add Equipment..."
                                onChange={(selected) => {
                                    if (selected && !workout.equipment.includes(selected)) {
                                        update({ equipment: [...workout.equipment, selected] });
                                    }
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Price */}
                            <div>
                                <label className="font-medium text-sm">Price (₹)</label>
                                <div className="relative mt-2">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={workout.price}
                                        onChange={(e) => update({ price: Number(e.target.value) })}
                                        placeholder="0"
                                        className="w-full pl-7 p-3 rounded-xl border focus:ring-1 outline-none"
                                        style={{ borderColor: LIGHT_BORDER }}
                                    />
                                </div>
                            </div>

                            {/* Trainer Name */}
                            <div>
                                <label className="font-medium text-sm">Trainer Name</label>
                                <input
                                    value={workout.trainerName || ""}
                                    onChange={(e) => update({ trainerName: e.target.value })}
                                    placeholder="Enter trainer name"
                                    className="w-full mt-2 p-3 rounded-xl border focus:ring-1 outline-none"
                                    style={{ borderColor: LIGHT_BORDER }}
                                />
                            </div>

                            {/* Calories Burned */}
                            <div>
                                <label className="font-medium text-sm">Calories Burned</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={workout.caloriesBurned}
                                    onChange={(e) => update({ caloriesBurned: Number(e.target.value) })}
                                    placeholder="Calories per session"
                                    className="w-full mt-2 p-3 rounded-xl border focus:ring-1 outline-none"
                                    style={{ borderColor: LIGHT_BORDER }}
                                />
                            </div>

                            <div>
                                <label className="font-medium text-sm">Assign to Membership Plans</label>
                                <div className="flex gap-4 mt-2">
                                    {MEMBERSHIP_PLANS.map((plan) => (
                                        <label key={plan} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={workout.plans.includes(plan)}
                                                onChange={() => togglePlan(plan)}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm">{plan}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Days */}
                <div className="space-y-6">
                    {workout.days.map((d, i) => (
                        <DayCard
                            key={d.id}
                            day={d}
                            index={i}
                            totalDays={workout.days.length}
                            onAddExercise={addExercise}
                            onRemoveDay={removeDay}
                            onUpdateDay={updateDay}
                            onRemoveExercise={removeExercise}
                            onUpdateExercise={updateExercise}
                        />
                    ))}
                </div>

                {/* Add Day */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={addDay}
                        className="px-6 py-3 rounded-xl border flex items-center gap-2 text-sm hover:bg-gray-100 transition"
                        style={{ borderColor: LIGHT_BORDER }}
                    >
                        <Plus size={16} /> Add Day
                    </button>
                </div>
            </div>

            {/* Toasts */}
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
}
