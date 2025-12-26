// src/pages/CreateNutritionPlan.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Image, ArrowUpRight, Download, ChevronDown, ChevronUp, Check } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const THEME = "#e3002a";
const LIGHT_BORDER = "#e5e7eb";
const uid = () => Math.random().toString(36).slice(2, 9);

// ---------------- Dropdown Component ----------------
const Dropdown = ({ options = [], value, onChange, className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-2 border rounded-lg bg-white text-sm font-medium shadow-sm hover:border-gray-300 transition"
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
            className="absolute z-30 w-full mt-1 bg-white border rounded-lg shadow-lg overflow-hidden"
            style={{ borderColor: LIGHT_BORDER }}
          >
            {options.map((opt) => (
              <div
                key={opt}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center text-sm font-medium transition"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                <span className="truncate">{opt}</span>
                {value === opt && <Check size={14} color={THEME} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------- Meal Card Component ----------------
const MealCard = ({ meal, dayIndex, onUpdateMeal, onRemoveMeal }) => {
  const [open, setOpen] = useState(true);

  const handleNutritionChange = (field, value) =>
    onUpdateMeal(dayIndex, meal.id, { nutrition: { ...meal.nutrition, [field]: Number(value) } });

  const handleListChange = (field, idx, value) => {
    const newList = meal[field].map((item, i) => (i === idx ? value : item));
    onUpdateMeal(dayIndex, meal.id, { [field]: newList });
  };

  const addToList = (field) => {
    const newList = meal[field] ? [...meal[field], ""] : [""];
    onUpdateMeal(dayIndex, meal.id, { [field]: newList });
  };

  const removeFromList = (field, idx) => {
    const newList = meal[field].filter((_, i) => i !== idx);
    onUpdateMeal(dayIndex, meal.id, { [field]: newList });
  };

  return (
    <div className="rounded-2xl bg-white border overflow-hidden shadow-md">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => setOpen(!open)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border bg-white hover:bg-gray-100 transition"
            style={{ borderColor: LIGHT_BORDER }}
          >
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <div className="flex-1 space-y-1">
            <label className="text-gray-500 text-xs font-medium">Meal Type</label>
            <Dropdown
              options={["Breakfast", "Lunch", "Dinner", "Snack"]}
              value={meal.type}
              onChange={(v) => onUpdateMeal(dayIndex, meal.id, { type: v })}
            />
            <label className="text-gray-500 text-xs font-medium mt-2">Meal Title</label>
            <input
              value={meal.title}
              onChange={(e) => onUpdateMeal(dayIndex, meal.id, { title: e.target.value })}
              placeholder="Meal Title"
              className="w-full p-2 rounded-lg border text-gray-900 font-semibold mt-1 shadow-sm focus:ring-1 focus:ring-red-600 focus:border-red-600 transition"
              style={{ borderColor: LIGHT_BORDER }}
            />
          </div>
        </div>
        <button onClick={() => onRemoveMeal(dayIndex, meal.id)} className="flex items-center gap-1 text-red-600 font-medium hover:text-red-700 transition">
          <Trash2 size={14} /> Remove
        </button>
      </div>

      {/* Accordion Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="px-6 pb-6 pt-4 space-y-4"
          >
            {/* Thumbnail */}
            <div>
              <label className="text-gray-500 text-xs font-medium">Thumbnail</label>
              <div className="w-36 h-28 rounded-xl border bg-gray-50 mt-1 overflow-hidden flex items-center justify-center relative" style={{ borderColor: LIGHT_BORDER }}>
                {meal.thumbnail ? (
                  <>
                    <img src={meal.thumbnail.url || meal.thumbnail} className="w-full h-full object-cover" />
                    <button
                      onClick={() => onUpdateMeal(dayIndex, meal.id, { thumbnail: null })}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center text-gray-400 text-xs">
                    <Image size={20} />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUpdateMeal(dayIndex, meal.id, { thumbnail: { file: f, url: URL.createObjectURL(f) } });
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-gray-500 text-xs font-medium">Description</label>
              <textarea
                value={meal.description}
                onChange={(e) => onUpdateMeal(dayIndex, meal.id, { description: e.target.value })}
                className="w-full p-2 border rounded-lg mt-1 shadow-sm focus:ring-1 focus:ring-red-600 focus:border-red-600 transition"
                placeholder="Description"
                style={{ borderColor: LIGHT_BORDER }}
              />
            </div>

            {/* ✅ FIXED: Dynamic Lists */}
            {["ingredients", "instructions", "tools", "notes"].map((field) => (
              <div key={field}>
                <label className="text-gray-500 text-xs font-medium capitalize">{field}</label>
                <div className="space-y-2 mt-1">
                  {(Array.isArray(meal[field]) ? meal[field] : []).map((val, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        value={val || ""}
                        onChange={(e) => handleListChange(field, idx, e.target.value)}
                        className="flex-1 p-2 border rounded-lg shadow-sm focus:ring-1 focus:ring-red-600 focus:border-red-600 transition"
                        placeholder={field.slice(0, -1)}
                        style={{ borderColor: LIGHT_BORDER }}
                      />
                      <button onClick={() => removeFromList(field, idx)} className="text-red-500 hover:text-red-600 transition">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addToList(field)}
                    className="flex items-center gap-2 mt-1 text-red-600 font-medium hover:text-red-700 transition"
                  >
                    <Plus size={16} /> Add {field.slice(0, -1)}
                  </button>
                </div>
              </div>
            ))}

            {/* Nutrition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {["calories", "protein", "carbs", "fat", "cholesterol", "sodium"].map((field) => (
                <div key={field}>
                  <label className="text-gray-500 text-xs font-medium">{field}</label>
                  <input
                    type="number"
                    value={meal.nutrition?.[field] || 0}
                    onChange={(e) => handleNutritionChange(field, e.target.value)}
                    className="w-full p-2 border rounded-lg mt-1 shadow-sm focus:ring-1 focus:ring-red-600 focus:border-red-600 transition"
                    style={{ borderColor: LIGHT_BORDER }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------- Admin Nutrition Page ----------------
export default function CreateNutritionPlan() {
  const [plan, setPlan] = useState({
    title: "",
    subtitle: "",
    description: "",
    coverImage: null,
    level: "Beginner",
    price: 0,
    plans: [],
    days: [
      {
        id: uid(),
        title: "Day 1",
        meals: [
          {
            id: uid(),
            type: "Breakfast",
            title: "",
            description: "",
            thumbnail: null,
            ingredients: [],
            instructions: [],
            tools: [],
            notes: [],
            nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, cholesterol: 0, sodium: 0 },
          },
        ],
      },
    ],
  });

  const update = (patch) => setPlan((p) => ({ ...p, ...patch }));

  const handleCoverImage = (file) =>
    update({ coverImage: file ? { file, url: URL.createObjectURL(file) } : null });

  const removeCoverImage = () => update({ coverImage: null });

  const addDay = () =>
    setPlan((p) => ({
      ...p,
      days: [
        ...p.days,
        {
          id: uid(),
          title: `Day ${p.days.length + 1}`,
          meals: [
            {
              id: uid(),
              type: "Breakfast",
              title: "",
              description: "",
              thumbnail: null,
              ingredients: [],
              instructions: [],
              tools: [],
              notes: [],
              nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, cholesterol: 0, sodium: 0 },
            },
          ],
        },
      ],
    }));

  const removeDay = (dayId) => setPlan((p) => ({ ...p, days: p.days.filter((d) => d.id !== dayId) }));

  const updateDayTitle = (dayId, title) =>
    setPlan((p) => ({ ...p, days: p.days.map((d) => (d.id === dayId ? { ...d, title } : d)) }));

  const addMeal = (dayId) => {
    const newMeal = {
      id: uid(),
      type: "Breakfast",
      title: "",
      description: "",
      thumbnail: null,
      ingredients: [],
      instructions: [],
      tools: [],
      notes: [],
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, cholesterol: 0, sodium: 0 },
    };
    setPlan((p) => ({ ...p, days: p.days.map((d) => (d.id === dayId ? { ...d, meals: [...d.meals, newMeal] } : d)) }));
  };

  const removeMeal = (dayId, mealId) =>
    setPlan((p) => ({ ...p, days: p.days.map((d) => (d.id === dayId ? { ...d, meals: d.meals.filter((m) => m.id !== mealId) } : d)) }));

  const updateMeal = (dayIndex, mealId, patch) => {
    setPlan((p) => ({
      ...p,
      days: p.days.map((d, idx) =>
        idx === dayIndex ? { ...d, meals: d.meals.map((m) => (m.id === mealId ? { ...m, ...patch } : m)) } : d
      ),
    }));
  };

  // ✅ FIXED: Export JSON Function
  const exportJSON = () => {
    const cleanPlan = {
      ...plan,
      coverImage: plan.coverImage?.url || null,
      days: plan.days.map(day => ({
        ...day,
        meals: day.meals.map(meal => ({
          ...meal,
          thumbnail: meal.thumbnail?.url || null
        }))
      }))
    };
    const json = JSON.stringify(cleanPlan, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plan.title || "nutrition_plan"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported successfully!");
  };

  const handleSave = async () => {
    if (!plan.title.trim()) {
      toast.error("Please enter a plan title!");
      return;
    }

    try {
      const formData = new FormData();

      // CLEAN JSON
      const cleanPlan = {
        title: plan.title.trim(),
        subtitle: plan.subtitle || "",
        description: plan.description || "",
        level: plan.level,
        price: Number(plan.price) || 0,
        days: plan.days.map((day, dayIdx) => ({
          title: day.title.trim() || `Day ${dayIdx + 1}`,
          meals: day.meals.map((meal) => ({
            type: meal.type,
            title: meal.title.trim() || "Untitled Meal",
            description: meal.description || "",
            ingredients: meal.ingredients.filter(Boolean),
            instructions: meal.instructions.filter(Boolean),
            tools: meal.tools.filter(Boolean),
            notes: meal.notes.filter(Boolean),
            nutrition: {
              calories: Number(meal.nutrition?.calories) || 0,
              protein: Number(meal.nutrition?.protein) || 0,
              carbs: Number(meal.nutrition?.carbs) || 0,
              fat: Number(meal.nutrition?.fat) || 0,
              cholesterol: Number(meal.nutrition?.cholesterol) || 0,
              sodium: Number(meal.nutrition?.sodium) || 0,
            },
            thumbnail: meal.thumbnail?.url || null, // URL for backend JSON
          })),
        })),
      };

      formData.append("data", JSON.stringify(cleanPlan));

      // ✅ Cover image
      if (plan.coverImage?.file) {
        formData.append("coverImage", plan.coverImage.file);
      }

      // ✅ Meal thumbnails with proper field names
      plan.days.forEach((day, dayIdx) => {
        day.meals.forEach((meal, mealIdx) => {
          if (meal.thumbnail?.file) {
            formData.append("mealThumbnails", meal.thumbnail.file);
          }
        });
      });


      // Send to backend
      const res = await axios.post("http://localhost:5000/api/nutrition/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Nutrition plan saved successfully!");
      console.log("Saved plan:", res.data);
    } catch (err) {
      console.error("Save error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to save plan!");
    }
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
          borderLeft: "6px solid #E3002A",
          fontFamily: "Poppins, sans-serif",
        }}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Nutrition Plan</h1>
            <p className="text-gray-500 mt-1">Build multi-day professional nutrition plans.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* ✅ FIXED: exportJSON button now works */}
            <button
              onClick={exportJSON}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white shadow-sm text-sm font-medium hover:bg-gray-50 transition"
              style={{ borderColor: LIGHT_BORDER }}
            >
              <ArrowUpRight size={16} /> Export JSON
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition"
              style={{ background: THEME }}
            >
              <Download size={16} /> Save Plan
            </button>
          </div>
        </div>

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COVER IMAGE */}
          <div>
            <label className="font-medium text-sm">Cover Image</label>
            <div
              className="mt-3 h-56 rounded-2xl border bg-white shadow-sm flex items-center justify-center relative overflow-hidden"
              style={{ borderColor: LIGHT_BORDER }}
            >
              {plan.coverImage ? (
                <>
                  <img src={plan.coverImage.url} className="w-full h-full object-cover" />
                  <button
                    onClick={removeCoverImage}
                    className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/70 transition"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer text-gray-400 flex flex-col items-center">
                  <div className="p-4 rounded-lg border border-dashed border-gray-300 hover:border-red-600 transition">
                    <Image size={32} />
                  </div>
                  <span className="text-xs mt-3">Upload 1200×675</span>
                  <input hidden type="file" accept="image/*" onChange={(e) => handleCoverImage(e.target.files?.[0])} />
                </label>
              )}
            </div>
          </div>

          {/* RIGHT SIDE INPUTS */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="font-medium text-sm">Plan Title</label>
              <input
                value={plan.title}
                onChange={(e) => update({ title: e.target.value })}
                className="w-full mt-2 p-3 rounded-xl border text-lg font-medium shadow-sm focus:ring-1 focus:ring-red-600 focus:border-red-600 transition"
                placeholder="e.g., 7-Day Healthy Meals"
                style={{ borderColor: LIGHT_BORDER }}
              />
            </div>
            <div>
              <label className="font-medium text-sm">Subtitle</label>
              <input
                value={plan.subtitle}
                onChange={(e) => update({ subtitle: e.target.value })}
                className="w-full mt-2 p-3 rounded-xl border shadow-sm focus:ring-1 focus:ring-red-600 focus:border-red-600 transition"
                placeholder="Subtitle..."
                style={{ borderColor: LIGHT_BORDER }}
              />
            </div>
            <div>
              <label className="font-medium text-sm">Description</label>
              <textarea
                value={plan.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={3}
                className="w-full mt-2 p-3 rounded-xl border shadow-sm focus:ring-1 focus:ring-red-600 focus:border-red-600 transition"
                placeholder="Description..."
                style={{ borderColor: LIGHT_BORDER }}
              />
            </div>

            {/* PRICING SECTION */}
            <div className="flex items-center gap-3 mt-6">
              <label className="font-semibold text-gray-800 w-12">Price :</label>

              <div className="flex items-center border rounded-lg px-3 py-2 bg-white"
                style={{ borderColor: LIGHT_BORDER }}>

                <span className="text-lg font-semibold text-gray-600">₹</span>

                <input
                  type="number"
                  min="0"
                  value={plan.price}
                  onChange={(e) => update({ price: Number(e.target.value) || 0 })}
                  className="w-20 text-center bg-transparent outline-none text-lg font-medium"
                  placeholder="499"
                />

                <span className="text-xs text-gray-500 ml-1">INR</span>
              </div>
            </div>

            {/* plan SECTION */}
            <div className="grid grid-cols-3 gap-3">
              {["Basic", "Pro", "Premium"].map((p) => {
                const isSelected = plan.plans.includes(p);

                return (
                  <div
                    key={p}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border 
          ${isSelected
                        ? "border-[#e3002a] bg-[#e3002a]/10 shadow-sm"
                        : "border-gray-300 hover:border-[#e3002a]"
                      }`}
                    onClick={() =>
                      update({
                        plans: isSelected
                          ? plan.plans.filter((pl) => pl !== p)
                          : [...plan.plans, p],
                      })
                    }
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
                      {p}
                    </span>
                  </div>
                );
              })}
            </div>



            <div className="flex gap-4">
              <div className="flex-1">
                <label className="font-medium text-sm">Level</label>
                <Dropdown options={["Beginner", "Intermediate", "Advanced"]} value={plan.level} onChange={(v) => update({ level: v })} />
              </div>
            </div>
          </div>
        </div>

        {/* DAYS */}
        <div className="space-y-4">
          {plan.days.map((day, idx) => (
            <div key={day.id} className="rounded-2xl bg-white border overflow-hidden shadow-md" style={{ borderColor: LIGHT_BORDER }}>
              <div className="px-6 py-4 flex items-center justify-between bg-gray-50">
                <input
                  value={day.title}
                  onChange={(e) => updateDayTitle(day.id, e.target.value)}
                  className="text-lg font-semibold border rounded-xl px-3 py-2 w-1/2 shadow-sm focus:ring-1 focus:ring-red-600 focus:border-red-600 transition"
                  style={{ borderColor: LIGHT_BORDER }}
                />
                {plan.days.length > 1 && (
                  <button className="flex items-center gap-1 text-red-600 font-medium hover:text-red-700 transition" onClick={() => removeDay(day.id)}>
                    <Trash2 size={16} /> Remove Day
                  </button>
                )}
              </div>
              <div className="space-y-4 px-6 pb-6 pt-4">
                {day.meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} dayIndex={idx} onUpdateMeal={updateMeal} onRemoveMeal={removeMeal} />
                ))}
                <button
                  onClick={() => addMeal(day.id)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white hover:bg-gray-50 shadow-sm transition"
                  style={{ borderColor: LIGHT_BORDER }}
                >
                  <Plus size={16} /> Add Meal
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addDay}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white hover:bg-gray-50 shadow-sm transition w-full"
            style={{ borderColor: LIGHT_BORDER }}
          >
            <Plus size={16} /> Add Day
          </button>
        </div>
      </div>
    </div>
  );
}