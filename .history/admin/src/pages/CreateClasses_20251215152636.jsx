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

const THEME = "#e3002a";
const LIGHT_BORDER = "#e5e7eb";
const LIGHT_SHADOW = "0 4px 16px rgba(0,0,0,0.05)";
const uid = () => Math.random().toString(36).slice(2, 9);

/* ------------------------------------------
   Reusable Dropdown
------------------------------------------*/
const ProDropdown = ({ options = [], value, onChange, className = "" }) => {
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

/* ------------------------------------------
   Exercise Card
------------------------------------------*/
// ------------------ ExerciseCard (UPDATED WITH SECTION + EQUIPMENT) ------------------
const ExerciseCard = ({ ex, dayId, onUpdateExercise, onRemoveExercise }) => {


    return (
        <div
            className="flex items-start gap-5 bg-white rounded-xl p-6 border transition-all hover:shadow-lg"
            style={{ borderColor: LIGHT_BORDER, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
        >
            {/* Thumbnail */}
            <div
                className="w-32 h-32 rounded-xl overflow-hidden border bg-gray-50 flex-shrink-0"
                style={{ borderColor: LIGHT_BORDER }}
            >
                {ex.thumbnail?.url ? (
                    <img src={ex.thumbnail.url} className="w-full h-full object-cover" alt={ex.title} />
                ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center h-full text-gray-400 text-xs">
                        <Image size={24} />
                        <span className="mt-1">Upload</span>
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    onUpdateExercise(dayId, ex.id, {
                                        thumbnail: { file, url: URL.createObjectURL(file) }
                                    });
                                }
                            }}
                        />
                    </label>
                )}
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-5">
                {/* Title */}
                <input
                    placeholder="Exercise Title"
                    value={ex.title || ""}
                    onChange={(e) => onUpdateExercise(dayId, ex.id, { title: e.target.value })}
                    className="w-full text-lg font-medium p-3 rounded-xl border focus:ring-2 focus:ring-[#e3002a]/20"
                    style={{ borderColor: LIGHT_BORDER }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Section Dropdown */}
                    <div>
                        <label className="text-xs font-medium text-gray-600">Section</label>
                        <ProDropdown
                            options={["Warm-up", "Workout", "Cool-down"]}
                            value={ex.section || "Workout"}
                            onChange={(v) => onUpdateExercise(dayId, ex.id, { section: v })}
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="text-xs font-medium text-gray-600">Type</label>
                        <ProDropdown
                            options={["time", "reps"]}
                            value={ex.type || "time"}
                            onChange={(v) => onUpdateExercise(dayId, ex.id, { type: v })}
                        />
                    </div>

                    {/* Time / Reps & Sets */}
                    {ex.type === "time" ? (
                        <div>
                            <label className="text-xs font-medium text-gray-600">Time (sec)</label>
                            <input
                                type="number"
                                value={ex.time || ""}
                                onChange={(e) => onUpdateExercise(dayId, ex.id, { time: Number(e.target.value) || 0 })}
                                placeholder="30"
                                className="w-full mt-1 p-3 rounded-xl border"
                                style={{ borderColor: LIGHT_BORDER }}
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Reps</label>
                                <input
                                    type="number"
                                    value={ex.reps || ""}
                                    onChange={(e) => onUpdateExercise(dayId, ex.id, { reps: Number(e.target.value) || 0 })}
                                    placeholder="12"
                                    className="w-full mt-1 p-3 rounded-xl border"
                                    style={{ borderColor: LIGHT_BORDER }}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Sets</label>
                                <input
                                    type="number"
                                    value={ex.sets || ""}
                                    onChange={(e) => onUpdateExercise(dayId, ex.id, { sets: Number(e.target.value) || 0 })}
                                    placeholder="3"
                                    className="w-full mt-1 p-3 rounded-xl border"
                                    style={{ borderColor: LIGHT_BORDER }}
                                />
                            </div>
                        </>
                    )}
                </div>


                {/* Notes */}
                <div>
                    <label className="text-xs font-medium text-gray-600">Notes / Cues</label>
                    <textarea
                        value={ex.notes || ""}
                        onChange={(e) => onUpdateExercise(dayId, ex.id, { notes: e.target.value })}
                        placeholder="Form tips, breathing cues..."
                        className="w-full mt-2 p-3 rounded-xl border h-24 resize-none"
                        style={{ borderColor: LIGHT_BORDER }}
                    />
                </div>

                {/* Remove Button */}
                <div className="flex justify-end">
                    <button
                        onClick={() => onRemoveExercise(dayId, ex.id)}
                        className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Remove Exercise
                    </button>
                </div>
            </div>
        </div>
    );
};
/* ------------------------------------------
   Class Card
------------------------------------------*/
const ClassCard = ({
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
                        <p className="text-xs text-gray-500 mt-1">
                            {day.exercises.length} exercises
                        </p>
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

            {/* Exercises */}
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
                            {day.exercises.map((ex) => (
                                <ExerciseCard
                                    key={ex.id}
                                    ex={ex}
                                    dayId={day.id}
                                    onUpdateExercise={onUpdateExercise}
                                    onRemoveExercise={onRemoveExercise}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ------------------------------------------
   Main Component
------------------------------------------*/
export default function CreateClasses() {
    const [classes, setClasses] = useState({
        title: "",
        description: "",
        thumbnail: null,
        duration: "30 – 45 min",
        level: "Beginner",
        price: 0,
        date: "",
        time: "",
        trainerName: "",
        status: "Active",
        caloriesBurned: "30-45 kcal",
        plans: [],
        equipment: [],
        classList: [
            {
                id: uid(),
                title: "Class 1",
                exercises: [
                    {
                        id: uid(),
                        title: "",
                        type: "time",
                        time: 30,
                        reps: 12,
                        sets: 1,
                        thumbnail: null,
                        notes: "",
                    },
                ],
            },
        ],
    });

    const update = (patch) => setClasses((p) => ({ ...p, ...patch }));

    const handleThumbnail = (file) =>
        update({ thumbnail: file ? { file, url: URL.createObjectURL(file) } : null });
    const removeThumbnail = () => update({ thumbnail: null });

    const addClass = () =>
        setClasses((c) => ({
            ...c,
            classList: [
                ...c.classList,
                {
                    title: `Class ${c.classList.length + 1}`,
                    exercises: [
                        { id: uid(), title: "", type: "time", time: 30, reps: 12, sets: 1, thumbnail: null, notes: "" },
                    ],
                },
            ],
        }));

    const removeClass = (id) =>
        setClasses((c) => ({
            ...c,
            classList: c.classList.filter((cl) => cl.id !== id),
        }));

    const updateClass = (id, patch) =>
        setClasses((c) => ({
            ...c,
            classList: c.classList.map((cl) => (cl.id === id ? { ...cl, ...patch } : cl)),
        }));

    const addExercise = (classId) =>
        setClasses((c) => ({
            ...c,
            classList: c.classList.map((cl) =>
                cl.id === classId
                    ? {
                        ...cl,
                        exercises: [
                            ...cl.exercises,
                            { id: uid(), title: "", type: "time", time: 30, reps: 12, sets: 1, thumbnail: null, notes: "" },
                        ],
                    }
                    : cl
            ),
        }));

    const removeExercise = (classId, exId) =>
        setClasses((c) => ({
            ...c,
            classList: c.classList.map((cl) =>
                cl.id === classId ? { ...cl, exercises: cl.exercises.filter((ex) => ex.id !== exId) } : cl
            ),
        }));

    const updateExercise = (classId, exId, patch) =>
        setClasses((c) => ({
            ...c,
            classList: c.classList.map((cl) =>
                cl.id === classId
                    ? { ...cl, exercises: cl.exercises.map((ex) => (ex.id === exId ? { ...ex, ...patch } : ex)) }
                    : cl
            ),
        }));

    const handleSave = async () => {
        if (!classes.title.trim()) {
            toast.error("Enter program title");
            return;
        }

        const formData = new FormData();

        //  MAIN THUMBNAIL
        if (classes.thumbnail?.file) {
            formData.append("thumbnail", classes.thumbnail.file);
        }

        //  EXERCISE THUMBNAILS - Keep frontend IDs for mapping
        classes.classList.forEach((day) => {
            day.exercises.forEach((ex) => {
                if (ex.thumbnail?.file) {
                    const fieldName = `exercise_${day.id}_${ex.id}`;
                    formData.append(fieldName, ex.thumbnail.file);
                    console.log(`📸 Uploading exercise: ${fieldName}`);
                }
            });
        });

        //  SUPER CLEAN DATA - NO ID FIELDS TO BACKEND
        const payload = {
            title: classes.title,
            description: classes.description || "",
            duration: classes.duration,
            level: classes.level,
            plans: classes.plans || [],
            price: Number(classes.price),
            date: classes.date || null,
            time: classes.time,
            trainerName: classes.trainerName,
            caloriesBurned: classes.caloriesBurned || "0 kcal",
            equipment: classes.equipment || [],
            days: classes.classList.map((day) => ({
                title: day.title,
                exercises: day.exercises.map((ex) => ({
                    title: ex.title || "",
                    type: ex.type || "time",
                    time: ex.time || null,
                    reps: ex.reps || null,
                    sets: ex.sets || null,
                    notes: ex.notes || "",
                    section: ex.section || "Workout",
                })),
            })),
        };
        // Append clean data (backend will handle thumbnails)
        formData.append("data", JSON.stringify(payload));

        console.log("Sending clean payload:", JSON.stringify(payload, null, 2));

        try {
            const res = await fetch("http://localhost:5000/api/classes", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(" Classes saved Succesfully!");
                console.log(" SUCCESS:", result);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                console.error(" Backend Error:", result);
                toast.error(result.message || result.error || "Save failed");
            }
        } catch (err) {
            console.error(" Network Error:", err);
            toast.error("Network error - please try again");
        }
    };
    const exportJSON = () => {
        const json = JSON.stringify(classes, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${classes.title || "classes"}.json`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-white rounded-lg py-10 px-6">
            <div className="max-w-6xl mx-auto">
                {/* HEADER */}
                <div className="flex items-start justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Fitness Classes</h1>
                        <p className="text-gray-500 mt-1">Build professional multi-class fitness programs.</p>
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

                {/* TOP SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* COVER IMAGE */}
                    <div>
                        <label className="font-medium text-sm">Program Cover Image</label>
                        <div
                            className="mt-3 h-56 rounded-2xl border bg-white shadow-sm flex items-center justify-center relative overflow-hidden"
                            style={{ borderColor: LIGHT_BORDER }}
                        >
                            {classes.thumbnail ? (
                                <>
                                    <img src={classes.thumbnail.url} className="w-full h-full object-cover" />
                                    <button
                                        onClick={removeThumbnail}
                                        className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <label className="cursor-pointer text-gray-400 flex flex-col items-center">
                                    <div className="p-3 rounded-lg border border-dashed border-gray-300">
                                        <Image size={32} />
                                    </div>
                                    <span className="text-xs mt-3">Upload 1200×675</span>
                                    <input hidden type="file" accept="image/*" onChange={(e) => handleThumbnail(e.target.files?.[0])} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* INPUTS */}
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label className="font-medium text-sm">Program Title</label>
                            <input
                                value={classes.title}
                                onChange={(e) => update({ title: e.target.value })}
                                className="w-full mt-2 p-3 rounded-xl border text-lg font-medium"
                                style={{ borderColor: LIGHT_BORDER }}
                                placeholder="e.g., 4-Week Strength Build"
                            />
                        </div>

                        <div>
                            <label className="font-medium text-sm">Short Description</label>
                            <textarea
                                value={classes.description}
                                onChange={(e) => update({ description: e.target.value })}
                                rows={3}
                                className="w-full mt-2 p-3 rounded-xl border"
                                style={{ borderColor: LIGHT_BORDER }}
                                placeholder="Overview..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                            {/* Duration */}
                            <div>
                                <label className="font-medium text-sm">Duration</label>
                                <input
                                    value={classes.duration}
                                    onChange={(e) => update({ duration: e.target.value })}
                                    className="w-full mt-2 p-3 rounded-xl border"
                                    style={{ borderColor: LIGHT_BORDER }}
                                    placeholder="30 – 45 min"
                                />
                            </div>

                            {/* Level */}
                            <div>
                                <label className="font-medium text-sm">Level</label>
                                <ProDropdown
                                    options={["Beginner", "Intermediate", "Advanced"]}
                                    value={classes.level}
                                    onChange={(v) => update({ level: v })}
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="font-medium text-sm">Price</label>
                                <div className="mt-2 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        value={classes.price}
                                        onChange={(e) => update({ price: Number(e.target.value) })}
                                        className="w-full pl-7 p-3 rounded-xl border"
                                        style={{ borderColor: LIGHT_BORDER }}
                                        placeholder="0"
                                        disabled={classes.includedInProgram} // disable if free
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="font-medium text-sm">Status</label>
                                <ProDropdown
                                    options={["Active", "Inactive"]}
                                    value={classes.status}
                                    onChange={(v) => update({ status: v })}
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="font-medium text-sm">Date</label>
                                <input
                                    type="date"
                                    value={classes.date}
                                    onChange={(e) => update({ date: e.target.value })}
                                    className="w-full mt-2 p-3 rounded-xl border"
                                    style={{ borderColor: LIGHT_BORDER }}
                                />
                            </div>

                            {/* Time */}
                            <div>
                                <label className="font-medium text-sm">Time</label>
                                <input
                                    type="time"
                                    value={classes.time}
                                    onChange={(e) => update({ time: e.target.value })}
                                    className="w-full mt-2 p-3 rounded-xl border"
                                    style={{ borderColor: LIGHT_BORDER }}
                                />
                            </div>

                            {/* Trainer Name */}
                            <div>
                                <label className="font-medium text-sm">Trainer Name</label>
                                <input
                                    value={classes.trainerName}
                                    onChange={(e) => update({ trainerName: e.target.value })}
                                    className="w-full mt-2 p-3 rounded-xl border"
                                    style={{ borderColor: LIGHT_BORDER }}
                                />
                            </div>

                            <div>
                                <label className="font-medium text-sm">Calories Burned</label>
                                <input
                                    type="text"
                                    value={classes.caloriesBurned}
                                    onChange={(e) => update({ caloriesBurned: e.target.value })}
                                    className="w-full mt-2 p-3 rounded-xl border"
                                    style={{ borderColor: LIGHT_BORDER }}
                                    placeholder="e.g., 200-300 kcal"
                                />
                            </div>

                            <div className="col-span-full mt-4">
                                <div className="flex flex-wrap items-center gap-4">

                                    {/* Label */}
                                    <label className="font-semibold text-gray-900 text-sm">
                                        Assign to Plans :
                                    </label>

                                    {/* Plan Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        {["Basic", "Premium", "Pro"].map((plan) => (
                                            <button
                                                key={plan}
                                                type="button"
                                                onClick={() => {
                                                    const currentPlans = classes.plans || [];
                                                    const updatedPlans = currentPlans.includes(plan)
                                                        ? currentPlans.filter((p) => p !== plan)
                                                        : [...currentPlans, plan];

                                                    update({ plans: updatedPlans });
                                                }}
                                                className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-200
                                                    ${classes.plans?.includes(plan)
                                                        ? "bg-[#e3002a] text-white border-[#e3002a] shadow-md"
                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {plan}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Program Level Equipment - Multiple Selection */}
                            <div className="col-span-full mt-6">
                                <label className="font-semibold text-gray-800 text-sm">
                                    Equipment Required for Program
                                </label>

                                <div className="flex flex-wrap gap-3 mt-3 mb-4">
                                    {(classes.equipment || []).map((eq, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm"
                                            style={{ backgroundColor: THEME }}
                                        >
                                            {eq}
                                            <button
                                                onClick={() => update({
                                                    equipment: classes.equipment.filter((_, i) => i !== idx)
                                                })}
                                                className="hover:bg-white/20 rounded-full p-0.5 transition"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}

                                    {(!classes.equipment || classes.equipment.length === 0) && (
                                        <span className="text-gray-400 text-sm italic">No equipment selected (Bodyweight only)</span>
                                    )}
                                </div>

                                <ProDropdown
                                    options={[
                                        "None", "Dumbbells", "Kettlebells", "Barbell", "Resistance Bands",
                                        "Pull-up Bar", "Bench", "Yoga Mat", "Jump Rope", "Machines", "Bodyweight Only"
                                    ].filter(opt => !(classes.equipment || []).includes(opt))}
                                    value="Add Equipment..."
                                    onChange={(selected) => {
                                        if (selected && !classes.equipment?.includes(selected)) {
                                            update({ equipment: [...(classes.equipment || []), selected] });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CLASSES */}
                <div className="space-y-4">
                    {classes.classList.map((day, idx) => (
                        <ClassCard
                            key={day.id}
                            day={day}
                            index={idx}
                            totalDays={classes.classList.length}
                            onAddExercise={addExercise}
                            onRemoveDay={removeClass}
                            onUpdateDay={updateClass}
                            onRemoveExercise={removeExercise}
                            onUpdateExercise={updateExercise}
                        />
                    ))}

                    <button
                        onClick={addClass}
                        className="px-4 py-2 border rounded-xl flex items-center gap-2 mt-3 bg-white hover:bg-gray-50 transition"
                        style={{ borderColor: LIGHT_BORDER }}
                    >
                        <Plus size={16} /> Add Class
                    </button>
                </div>
            </div>

            <style>{`
        input:focus, textarea:focus {
          outline: none !important;
          border-color: ${THEME} !important;
          box-shadow: 0 0 0 2px ${THEME}22 !important;
        }
        button:focus { outline: none; }
        .rounded-2xl { border-radius: 18px; }
        .shadow-md { box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
      `}</style>
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
