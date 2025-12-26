import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
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
  UploadCloud
} from "lucide-react";

const THEME = "#e3002a";
const LIGHT_BORDER = "#e5e7eb";
const LIGHT_SHADOW = "0 4px 16px rgba(0,0,0,0.05)";
const PLAN_OPTIONS = ["Basic", "Premium", "Pro"];
const uid = () => Math.random().toString(36).slice(2, 9);

/* ------------------- ProDropdown ------------------- */
const ProDropdown = ({ options = [], value, onChange, className = "", multi = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // For multi-select, value should be an array
  const displayValue = multi
    ? Array.isArray(value) && value.length > 0
      ? value.join(", ")
      : "Select..."
    : value;

  const handleSelect = (opt) => {
    if (multi) {
      const next = Array.isArray(value)
        ? value.includes(opt)
          ? value.filter((x) => x !== opt)
          : [...value, opt]
        : [opt];
      onChange(next);
    } else {
      onChange(opt);
      setOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full px-3 py-2 rounded-xl border bg-white flex items-center justify-between text-sm shadow-sm"
        style={{ borderColor: LIGHT_BORDER }}
      >
        <span className="truncate">{displayValue}</span>
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
                onClick={() => handleSelect(opt)}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-sm"
              >
                <span className="truncate">{opt}</span>
                {(multi ? value.includes(opt) : opt === value) && <Check size={14} color={THEME} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ------------------- StepCard ------------------- */
const StepCard = ({ step, dayIndex, stepIndex, onUpdateStep, onRemoveStep }) => {
  return (
    <div
      className="flex items-start gap-5 bg-white rounded-xl p-4 border transition-all"
      style={{ borderColor: LIGHT_BORDER, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
    >
      <div
        className="w-28 h-24 rounded-xl overflow-hidden border bg-gray-50 flex-shrink-0"
        style={{ borderColor: LIGHT_BORDER }}
      >
        {step.image?.url ? (
          <img src={step.image.url} className="w-full h-full object-cover" alt={step.name || "step image"} />
        ) : (
          <label className="cursor-pointer flex flex-col items-center text-gray-400 text-xs justify-center h-full">
            <Image size={20} />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpdateStep(dayIndex, stepIndex, { image: { file: f, url: URL.createObjectURL(f) } });
              }}
            />
            <div className="mt-2">Upload</div>
          </label>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <input
            placeholder="Exercise name"
            value={step.name}
            onChange={(e) => onUpdateStep(dayIndex, stepIndex, { name: e.target.value })}
            className="w-full p-2 rounded-xl border focus:ring-1"
            style={{ borderColor: LIGHT_BORDER }}
          />
        </div>

        <div>
          <ProDropdown
            options={["time", "reps"]}
            value={step.type}
            onChange={(v) => onUpdateStep(dayIndex, stepIndex, { type: v })}
          />
        </div>

        <div className="flex items-center gap-2">
          {step.type === "time" ? (
            <input
              type="number"
              placeholder="Time (sec)"
              value={step.duration || ""}
              onChange={(e) => onUpdateStep(dayIndex, stepIndex, { duration: Number(e.target.value) || 0 })}
              className="p-2 rounded-xl border w-full"
              style={{ borderColor: LIGHT_BORDER }}
            />
          ) : (
            <input
              type="number"
              placeholder="Reps"
              value={step.reps || ""}
              onChange={(e) => onUpdateStep(dayIndex, stepIndex, { reps: Number(e.target.value) || 0 })}
              className="p-2 rounded-xl border w-full"
              style={{ borderColor: LIGHT_BORDER }}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Calories"
            value={step.calories || ""}
            onChange={(e) => onUpdateStep(dayIndex, stepIndex, { calories: Number(e.target.value) || 0 })}
            className="p-2 rounded-xl border w-24"
            style={{ borderColor: LIGHT_BORDER }}
          />
          <span className="text-sm text-gray-500">kcal</span>
        </div>

        <div className="flex justify-end items-center">
          <button
            onClick={() => {
              onRemoveStep(dayIndex, stepIndex);
              toast.info("Step removed!");
            }}
            className="text-red-600 text-sm flex items-center gap-1"
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------- DayCard ------------------- */
const DayCard = ({ day, dayIndex, totalDays, onAddStep, onRemoveDay, onUpdateDayTitle, onUpdateStep, onRemoveStep }) => {
  const totalTime = (day.steps || []).reduce((s, st) => s + (st.type === "time" ? (Number(st.duration) || 0) : (Number(st.reps || 0) * 2)), 0);
  const totalCalories = (day.steps || []).reduce((s, st) => s + (Number(st.calories || 0)), 0);

  return (
    <div
      className="rounded-2xl bg-white border w-full overflow-hidden"
      style={{ borderColor: LIGHT_BORDER, boxShadow: LIGHT_SHADOW }}
    >
      <div className="px-5 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <div>
            <input
              value={day.title}
              onChange={(e) => onUpdateDayTitle(dayIndex, e.target.value)}
              className="text-[20px] font-semibold outline-none text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">{(day.steps || []).length} steps • {Math.round(totalTime)}s • {totalCalories} kcal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onAddStep(dayIndex)}
            className="px-4 py-2 rounded-xl border text-sm flex items-center gap-2 hover:bg-gray-100 transition font-medium"
            style={{ borderColor: LIGHT_BORDER }}
          >
            <Plus size={14} /> Add Step
          </button>

          {totalDays > 1 && (
            <button
              onClick={() => onRemoveDay(dayIndex)}
              className="text-sm text-red-600 flex items-center gap-1 font-medium"
            >
              <Trash2 size={14} /> Remove Day
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18 }}
          className="px-5 pb-5 pt-4 bg-white border-t"
          style={{ borderColor: LIGHT_BORDER }}
        >
          <div className="space-y-4">
            {(day.steps || []).map((step, sIdx) => (
              <StepCard
                key={step.id}
                step={step}
                dayIndex={dayIndex}
                stepIndex={sIdx}
                onUpdateStep={onUpdateStep}
                onRemoveStep={onRemoveStep}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ------------------- Main Component ------------------- */
export default function CreateChallenges() {
  const [data, setData] = useState({
    title: "",
    description: "",
    difficulty: "Beginner",
    duration: "1 week",
    thumbnail: null,
    categories: "",
    equipment: "",
    price: 0,
    plans: [],
    days: [
      {
        id: uid(),
        title: "Day 1",
        steps: [{ id: uid(), name: "", type: "time", duration: 30, reps: 0, image: null, calories: 0 }],
      },
    ],
  });

  const CATEGORY_OPTIONS = ["Weight Loss", "Yoga", "Home Workout", "Strength", "Mobility", "Cardio", "Flexibility"];
  const EQUIP_OPTIONS = ["None", "Dumbbells", "Resistance Band", "Mat", "Kettlebell"];

  const update = (patch) => setData((p) => ({ ...p, ...patch }));

  const handleThumbnail = (file) => update({ thumbnail: file ? { file, url: URL.createObjectURL(file) } : null });
  const removeThumbnail = () => update({ thumbnail: null });

  const addDay = () => {
    setData((d) => ({
      ...d,
      days: [...d.days, { id: uid(), title: `Day ${d.days.length + 1}`, steps: [] }],
    }));
    toast.success("Day added!");
  };

  const removeDay = (dayIndex) => {
    setData((d) => {
      const next = d.days.filter((_, i) => i !== dayIndex);
      const ren = next.map((nd, i) => ({ ...nd, title: nd.title.startsWith("Day ") ? `Day ${i + 1}` : nd.title }));
      return { ...d, days: ren };
    });
    toast.info("Day removed!");
  };

  const updateDayTitle = (index, title) => setData((d) => ({ ...d, days: d.days.map((x, i) => (i === index ? { ...x, title } : x)) }));

  const addStep = (dayIndex) => {
    setData((d) => ({
      ...d,
      days: d.days.map((day, i) =>
        i === dayIndex ? { ...day, steps: [...(day.steps || []), { id: uid(), name: "", type: "time", duration: 30, reps: 0, image: null, calories: 0 }] } : day
      ),
    }));
    toast.success("Step added!");
  };

  const removeStep = (dayIndex, stepIndex) => {
    setData((d) => ({
      ...d,
      days: d.days.map((day, i) => (i === dayIndex ? { ...day, steps: day.steps.filter((_, s) => s !== stepIndex) } : day)),
    }));
    toast.info("Step removed!");
  };

  const updateStep = (dayIndex, stepIndex, patch) => {
    setData((d) => ({
      ...d,
      days: d.days.map((day, i) => {
        if (i !== dayIndex) return day;
        const steps = day.steps.map((s, si) => (si === stepIndex ? { ...s, ...patch } : s));
        return { ...day, steps };
      }),
    }));
  };

  const toggleArrayValue = (key, val) => setData((d) => {
    const list = d[key] || [];
    const next = list.includes(val) ? list.filter((x) => x !== val) : [...list, val];
    return { ...d, [key]: next };
  });

  const calculateTotals = (payload) => {
    const days = payload.days || [];
    let totalDays = days.length;
    let totalTime = 0;
    let totalCalories = 0;
    const daysWithTotals = days.map((day) => {
      let dayTime = 0;
      let dayCalories = 0;
      const steps = (day.steps || []).map((s) => {
        const stepTime = s.type === "time" ? (Number(s.duration) || 0) : (Number(s.reps || 0) * 2);
        dayTime += stepTime;
        dayCalories += Number(s.calories || 0);
        return { ...s };
      });
      totalTime += dayTime;
      totalCalories += dayCalories;
      return { ...day, totalTime: dayTime, totalCalories: dayCalories, steps };
    });

    return { totalDays, totalTime, totalCalories, days: daysWithTotals };
  };

  const assemblePayload = () => {
    const { totalDays, totalTime, totalCalories, days } = calculateTotals(data);
    const backendDays = days.map((d) => ({
      title: d.title,
      totalTime: d.totalTime,
      totalCalories: d.totalCalories,
      steps: (d.steps || []).map((s) => ({
        id: s.id || uid(),
        name: s.name || "",
        type: s.type,
        duration: s.type === "time" ? Number(s.duration || 0) : undefined,
        reps: s.type === "reps" ? Number(s.reps || 0) : undefined,
        calories: Number(s.calories || 0),
        image: s.image?.url || null,
      })),
    }));

    return {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      duration: data.duration,
      categories: data.categories,
      equipment: data.equipment,
      price: Number(data.price || 0),
      plans: data.plans,
      totalDays,
      totalTime,
      totalCalories,
      days: backendDays,
    };
  };

  const handleSubmitToAPI = async () => {
    try {
      if (!data.title?.trim()) {
        toast.error("Enter challenge title!");
        return;
      }

      const payload = assemblePayload();
      const form = new FormData();
      form.append("data", JSON.stringify(payload));

      if (data.thumbnail?.file) form.append("thumbnail", data.thumbnail.file);

      data.days.forEach((d, di) => {
        (d.steps || []).forEach((s, si) => {
          if (s.image?.file) form.append(`image_${di}_${si}`, s.image.file);
        });
      });

      const res = await fetch("http://localhost:5000/api/challenges/create", {
        method: "POST",
        body: form,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
                  credentials: "include",

      });

      const resData = await res.json();
      if (!res.ok) {
        toast.error(resData.message || "Server error");
        console.error(resData);
        return;
      }

      toast.success("Challenge created successfully!");
      console.log("Saved:", resData);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const exportJSON = () => {
    const payload = assemblePayload();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title || "challenge"}.json`;
    a.click();
    toast.info("JSON exported");
  };

  return (
    <div className="min-h-screen bg-white rounded-lg py-10 px-6">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="dark"
        toastStyle={{
          backgroundColor: "#1E1E1E",
          color: "#fff",
          borderLeft: `6px solid ${THEME}`,
          fontFamily: "Poppins, sans-serif",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Challenges</h1>
            <p className="text-gray-500 mt-1">Build professional multi-step challenges (Days & Exercises).</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportJSON} className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white shadow-sm text-sm hover:bg-gray-50" style={{ borderColor: LIGHT_BORDER }}>
              <ArrowUpRight size={16} /> Export JSON
            </button>

            <button onClick={handleSubmitToAPI} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-md" style={{ background: THEME }}>
              <UploadCloud size={16} /> Save Challenges
            </button>
          </div>
        </div>

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* COVER IMAGE */}
          <div>
            <label className="font-medium text-sm">Challenge Cover Image</label>
            <div className="mt-3 h-56 rounded-2xl border bg-white shadow-sm flex items-center justify-center relative overflow-hidden" style={{ borderColor: LIGHT_BORDER }}>
              {data.thumbnail ? (
                <>
                  <img src={data.thumbnail.url} className="w-full h-full object-cover" alt="cover" />
                  <button onClick={() => { removeThumbnail(); toast.info("Thumbnail removed!"); }} className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full">
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
              <label className="font-medium text-sm">Challenge Title</label>
              <input
                value={data.title}
                onChange={(e) => update({ title: e.target.value })}
                className="w-full mt-2 p-3 rounded-xl border text-lg font-medium"
                style={{ borderColor: LIGHT_BORDER }}
                placeholder="e.g., 7-Day Core Challenge"
              />
            </div>

            <div>
              <label className="font-medium text-sm">Short Description</label>
              <textarea
                value={data.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={3}
                className="w-full mt-2 p-3 rounded-xl border"
                style={{ borderColor: LIGHT_BORDER }}
                placeholder="Overview..."
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="font-medium text-sm">Duration</label>
                <input
                  value={data.duration}
                  onChange={(e) => update({ duration: e.target.value })}
                  className="w-full mt-2 p-3 rounded-xl border"
                  style={{ borderColor: LIGHT_BORDER }}
                  placeholder="e.g., 1 week"
                />
              </div>

              <div className="w-48">
                <label className="font-medium text-sm">Difficulty</label>
                <ProDropdown
                  options={["Beginner", "Intermediate", "Advanced"]}
                  value={data.difficulty}
                  className="w-full p-3 rounded-xl"
                  onChange={(v) => update({ difficulty: v })}
                />
              </div>
            </div>

            {/* Categories & Equipment */}
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="font-medium text-sm">Categories</label>
                <ProDropdown
                  options={CATEGORY_OPTIONS}
                  value={data.categories || "Select category"}
                  className="mt-2"
                  onChange={(val) => update({ categories: val })} // only one selected
                />
              </div>

              <div className="w-64">
                <label className="font-medium text-sm">Equipment</label>
                <ProDropdown
                  options={EQUIP_OPTIONS}
                  value={data.equipment || "Select equipment"}
                  className="mt-2"
                  onChange={(val) => update({ equipment: val })} // only one selected
                />
              </div>


            </div>

            {/* Price - Always Visible */}
            <div className="flex items-center gap-4 mt-6">
              <label className="font-medium text-sm whitespace-nowrap">Challenge Price</label>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-700">₹</span>
                <input
                  type="number"
                  min="0"
                  placeholder="499"
                  value={data.price || ""}
                  onChange={(e) => update({ price: Number(e.target.value) || 0 })}
                  className="w-40 p-3 rounded-xl border text-lg font-medium text-center focus:ring-2"
                  style={{
                    borderColor: LIGHT_BORDER,
                    ringColor: THEME + "40"
                  }}
                />
                <span className="text-sm text-gray-500">INR</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Plans
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {["Basic", "Premium", "Pro"].map((plan) => {
                  const isSelected = data.plans.includes(plan);

                  return (
                    <div
                      key={plan}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border 
                        ${isSelected
                          ? "border-[#e3002a] bg-[#e3002a]/10 shadow-sm"
                          : "border-gray-300 hover:border-[#e3002a]"
                        }`}
                      onClick={() => {
                        if (isSelected) {
                          setData({
                            ...data,
                            plans: data.plans.filter((p) => p !== plan),
                          });
                        } else {
                          setData({
                            ...data,
                            plans: [...data.plans, plan],
                          });
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }}
                        className="h-4 w-4 accent-[#e3002a] cursor-pointer"
                      />

                      <span
                        className={`text-sm font-medium ${isSelected ? "text-[#e3002a]" : "text-gray-700"
                          }`}
                      >
                        {plan}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* DAYS */}
        <div className="space-y-4">
          {data.days.map((day, idx) => (
            <DayCard
              key={day.id}
              day={day}
              dayIndex={idx}
              totalDays={data.days.length}
              onAddStep={(di) => addStep(di)}
              onRemoveDay={(di) => removeDay(di)}
              onUpdateDayTitle={updateDayTitle}
              onUpdateStep={updateStep}
              onRemoveStep={removeStep}
            />
          ))}

          <div>
            <button onClick={addDay} className="px-4 py-2 border rounded-xl flex items-center gap-2 mt-3 bg-white hover:bg-gray-50 transition" style={{ borderColor: LIGHT_BORDER }}>
              <Plus size={16} /> Add Day
            </button>
          </div>
        </div>
      </div>

      <style>{`
        input:focus, textarea:focus { outline: none !important; border-color: ${THEME} !important; box-shadow: 0 0 0 2px ${THEME}22 !important; }
        button:focus { outline: none; }
        .rounded-2xl { border-radius: 18px; }
        .shadow-md { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
      `}</style>
    </div >
  );
}
