// src/pages/NutritionPage.jsx → FINAL PERFECTED VERSION (NO LOCAL STORAGE, BACKEND SYNC ONLY)

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Utensils,
  Flame,
  CheckCircle,
  Clock,
  Info,
  Star,
  Droplet,
  Apple,
  Lock,
  ShoppingCart,
  Copy,
  Download,
  X,
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const THEME = "#e3002a";

function MacroBubble({ label, value, unit }) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-2 rounded-lg border shadow-sm w-28 min-w-[72px]">
      <div className="text-xs text-gray-500 truncate">{label}</div>
      <div className="text-sm font-semibold text-gray-800 truncate">
        {value}
        {unit && <span className="text-xs text-gray-400"> {unit}</span>}
      </div>
    </div>
  );
}

function MealListItem({ meal, onSelect, selected, completed, onToggleComplete }) {
  return (
    <motion.div
      layout
      onClick={() => onSelect(meal._id)}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all hover:shadow-md ${
        selected ? "ring-2 ring-red-500 bg-red-50" : "bg-white"
      }`}
    >
      <img
        src={meal.thumbnail?.url || "/meal-placeholder.jpg"}
        alt={meal.title}
        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold text-gray-800 truncate">{meal.title}</div>
          <div className="text-xs text-gray-500 whitespace-nowrap">{meal.type}</div>
        </div>
        <div className="text-sm text-gray-500 mt-1 flex gap-3 flex-wrap">
          <span className="whitespace-nowrap">{meal.nutrition?.calories || 0} cal</span>
          <span className="whitespace-nowrap">{meal.nutrition?.protein || 0}g P</span>
          <span className="whitespace-nowrap">{meal.nutrition?.carbs || 0}g C</span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(meal);
        }}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          completed
            ? "bg-green-600 text-white"
            : "bg-gray-100 text-gray-600 border border-gray-300"
        }`}
      >
        {completed ? (
          <span className="flex items-center gap-1">
            <CheckCircle size={14} /> Done
          </span>
        ) : (
          "Mark Done"
        )}
      </button>
    </motion.div>
  );
}

function WaterTracker({ cups, setCups }) {
  const cupsTotal = 8;
  const mlPerCup = 240;
  const filled = Math.min(cupsTotal, Math.max(0, cups));

  const updateWater = async (increment) => {
    try {
      await axios.post(
        "http://localhost:5000/api/stats/water",
        { increment },
        { withCredentials: true }
      );
      setCups((prev) => prev + increment);
      toast.success(increment > 0 ? "+1 Glass Added" : "Glass Removed", {
        icon: <Droplet size={16} />,
      });
    } catch (err) {
      toast.error("Failed to update hydration");
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Hydration Tracker</h4>
        <div className="text-sm text-gray-500">
          {filled * mlPerCup} / {cupsTotal * mlPerCup} ml
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: cupsTotal }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg border flex flex-col items-center justify-center transition-all ${
              i < filled
                ? "bg-blue-100 border-blue-300"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <Droplet
              size={20}
              className={i < filled ? "text-blue-600" : "text-gray-300"}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => updateWater(-1)}
          disabled={cups <= 0}
          className="flex-1 py-2 rounded-full border text-sm disabled:opacity-50"
        >
          − Remove
        </button>
        <button
          onClick={() => updateWater(1)}
          disabled={cups >= cupsTotal}
          className="flex-1 py-2 rounded-full text-white text-sm disabled:opacity-70"
          style={{ background: THEME }}
        >
          + Add Glass
        </button>
      </div>
    </div>
  );
}

function WeeklyMacroSummary({ data }) {
  if (!data || data.length === 0)
    return <div className="text-center text-gray-400 py-6">No weekly data</div>;

  const max = Math.max(...data, 1);

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <h4 className="font-semibold mb-4">Weekly Calories</h4>
      <div className="space-y-3">
        {data.map((cal, i) => {
          const percent = (cal / max) * 100;
          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 text-xs text-gray-500 font-medium">{days[i]}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: i === 6 ? THEME : "#fca5a5",
                  }}
                />
              </div>
              <div className="w-12 text-right text-xs font-medium text-gray-700">
                {cal}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewsBox({ reviews }) {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <h4 className="font-semibold mb-3">Member Reviews</h4>
      <div className="space-y-4">
        {reviews.slice(0, 3).map((r, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600">
              {r.initials}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-current" /> {r.rating}
                </p>
              </div>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.comment}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 border rounded-full text-sm hover:bg-gray-50 transition">
        View All Reviews
      </button>
    </div>
  );
}

function GroceryListModal({ open, onClose, items, onCopy, onDownloadTxt, onDownloadCsv }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <ShoppingCart size={22} className="text-red-600" />
            <h3 className="text-xl font-bold">Grocery List</h3>
            <span className="text-sm text-gray-500">({items.length} items)</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCopy} className="px-4 py-2 border rounded-full text-sm flex items-center gap-2 hover:bg-gray-50">
              <Copy size={16} /> Copy
            </button>
            <button onClick={onDownloadTxt} className="px-4 py-2 border rounded-full text-sm flex items-center gap-2 hover:bg-gray-50">
              <Download size={16} /> TXT
            </button>
            <button onClick={onDownloadCsv} className="px-4 py-2 border rounded-full text-sm flex items-center gap-2 hover:bg-gray-50">
              <Download size={16} /> CSV
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No ingredients for today.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li key={i} className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-800">{item.name}</span>
                  <span className="text-sm text-gray-500">
                    {item.count > 1 ? `${item.count}x` : "1x"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Tip: Review and edit quantities before shopping.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function NutritionPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [completedMealIds, setCompletedMealIds] = useState([]); // From backend
  const [cups, setCups] = useState(0);
  const [filter, setFilter] = useState("All");
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [groceryItems, setGroceryItems] = useState([]);

  // Fetch plans + today's stats (water + completed meals)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, statsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/nutrition/my/plans", { withCredentials: true }),
          axios.get("http://localhost:5000/api/stats/today", { withCredentials: true }),
        ]);

        const userPlans = plansRes.data.plans || [];
        setPlans(userPlans);

        if (userPlans.length > 0) {
          setSelectedPlanId(userPlans[0]._id);
        }

        setCups(statsRes.data.water || 0);
        setCompletedMealIds(statsRes.data.completedMeals || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load nutrition data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-select first meal when day/plan changes
  useEffect(() => {
    if (!loading && plans.length > 0 && selectedPlanId) {
      const plan = plans.find((p) => p._id === selectedPlanId);
      const day = plan?.days?.[selectedDayIndex];
      const firstMeal = day?.meals?.[0];
      if (firstMeal?._id) {
        setSelectedMealId(firstMeal._id);
      } else {
        setSelectedMealId(null);
      }
    }
  }, [selectedDayIndex, selectedPlanId, plans, loading]);

  const currentPlan = plans.find((p) => p._id === selectedPlanId) || {};
  const currentDay = currentPlan.days?.[selectedDayIndex] || { meals: [] };
  const filteredMeals = filter === "All"
    ? currentDay.meals
    : currentDay.meals.filter((m) => m.type === filter);

  const selectedMeal = currentDay.meals.find((m) => m._id === selectedMealId) || filteredMeals[0];

  const completeMeal = async (meal) => {
    if (!meal?._id || !meal.nutrition) {
      toast.error("Invalid meal data");
      return;
    }

    if (completedMealIds.includes(meal._id)) {
      toast.info("Already marked as done today");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/stats/meal",
        {
          calories: meal.nutrition.calories || 0,
          protein: meal.nutrition.protein || 0,
          carbs: meal.nutrition.carbs || 0,
          fats: meal.nutrition.fat || 0,
        },
        { withCredentials: true }
      );

      setCompletedMealIds((prev) => [...prev, meal._id]);
      toast.success(`${meal.title} marked as done!`);
    } catch (err) {
      toast.error("Failed to log meal");
    }
  };

  const buildGroceryList = () => {
    const map = new Map();
    currentDay.meals.forEach((meal) => {
      meal.ingredients?.forEach((ing) => {
        const trimmed = ing.trim();
        if (trimmed) {
          map.set(trimmed, (map.get(trimmed) || 0) + 1);
        }
      });
    });

    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  };

  const openGrocery = () => {
    setGroceryItems(buildGroceryList());
    setShowGroceryModal(true);
  };

  const handleCopy = async () => {
    const text = groceryItems.map((i) => `• ${i.name} ${i.count > 1 ? `(${i.count}x)` : ""}`).join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadTxt = () => {
    const content = `Grocery List - ${currentPlan.title} - Day ${selectedDayIndex + 1}\n\n` +
      groceryItems.map((i) => `• ${i.name} ${i.count > 1 ? `(${i.count}x)` : ""}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grocery-day-${selectedDayIndex + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("TXT downloaded");
  };

  const handleDownloadCsv = () => {
    const rows = [["Ingredient", "Count"], ...groceryItems.map((i) => [i.name, i.count])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grocery-day-${selectedDayIndex + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  const reviews = [
    { name: "Asha P.", initials: "AP", rating: "5.0", comment: "Great plan — easy to follow and delicious meals!" },
    { name: "Ravi K.", initials: "RK", rating: "5.0", comment: "Finally hitting my protein goals consistently." },
    { name: "Neha S.", initials: "NS", rating: "4.8", comment: "Clear recipes and beautiful presentation." },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Apple className="w-16 h-16 mx-auto text-red-600 animate-bounce" />
          <p className="mt-6 text-xl font-semibold text-gray-700">Loading your nutrition plan...</p>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <Lock className="w-32 h-32 mx-auto text-gray-300 mb-8" />
          <h2 className="text-4xl font-extrabold text-gray-800 mb-6">No Active Nutrition Plan</h2>
          <p className="text-gray-600 text-lg mb-10">
            Unlock personalized daily meals, recipes, macros, and grocery lists by purchasing a plan.
          </p>
          <a
            href="/nutrition-plans"
            className="inline-flex items-center gap-4 px-10 py-5 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-full transition shadow-xl"
          >
            <Apple className="w-8 h-8" />
            Browse Nutrition Plans
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <GroceryListModal
        open={showGroceryModal}
        onClose={() => setShowGroceryModal(false)}
        items={groceryItems}
        onCopy={handleCopy}
        onDownloadTxt={handleDownloadTxt}
        onDownloadCsv={handleDownloadCsv}
      />

      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">My Nutrition Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Track meals, hydration, progress — all in one place.
              </p>
            </div>
            <div className="text-sm bg-gray-100 px-4 py-2 rounded-full">
              Active Plan: <span className="font-bold text-gray-800">{currentPlan.title}</span>
            </div>
          </div>

          {/* Plan Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan._id}
                onClick={() => {
                  setSelectedPlanId(plan._id);
                  setSelectedDayIndex(0);
                }}
                className={`rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${
                  plan._id === selectedPlanId
                    ? "border-red-600 shadow-xl ring-4 ring-red-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={plan.coverImage?.url || "/plan-placeholder.jpg"}
                  alt={plan.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 bg-white">
                  <h4 className="font-bold text-lg">{plan.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{plan.days?.length || 0} Days • {plan.level}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Day Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-3">
            {currentPlan.days?.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDayIndex(i)}
                className={`px-6 py-3 rounded-full font-medium transition whitespace-nowrap ${
                  selectedDayIndex === i
                    ? "text-white shadow-lg"
                    : "bg-white text-gray-700 border"
                }`}
                style={selectedDayIndex === i ? { background: THEME } : {}}
              >
                Day {i + 1}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            {["All", "Breakfast", "Lunch", "Dinner", "Snack"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  filter === f
                    ? "text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
                style={filter === f ? { background: THEME } : {}}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              {/* Progress Card */}
              <div className="bg-white rounded-2xl p-6 shadow border">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Today's Progress</h3>
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">Today</span>
                </div>
                <div className="flex justify-center">
                  <div className="relative">
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke={THEME}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(completedMealIds.length / (currentDay.meals?.length || 1)) * 440} 440`}
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold">
                        {Math.round((completedMealIds.length / (currentDay.meals?.length || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-gray-600 mt-4 text-sm">
                  {completedMealIds.length} / {currentDay.meals?.length || 0} meals completed
                </p>
              </div>

              {/* Day Summary */}
              <div className="bg-white rounded-2xl p-6 shadow border flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Day {selectedDayIndex + 1}</h3>
                  <p className="text-gray-600 mt-1">
                    {currentDay.meals?.length || 0} meals • Target: ~2000 kcal
                  </p>
                </div>
                <button
                  onClick={openGrocery}
                  className="px-5 py-3 bg-gray-100 rounded-full flex items-center gap-2 hover:bg-gray-200 transition"
                >
                  <ShoppingCart size={18} />
                  Grocery List
                </button>
              </div>

              {/* Meal List */}
              <div className="bg-white rounded-2xl p-5 shadow border max-h-96 overflow-y-auto">
                {filteredMeals.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">Rest day — no meals scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredMeals.map((meal) => (
                      <MealListItem
                        key={meal._id}
                        meal={meal}
                        selected={meal._id === selectedMealId}
                        completed={completedMealIds.includes(meal._id)}
                        onSelect={setSelectedMealId}
                        onToggleComplete={completeMeal}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WaterTracker cups={cups} setCups={setCups} />
                <WeeklyMacroSummary data={[1850, 1980, 2020, 1750, 2150, 2080, 1920]} />
                <ReviewsBox reviews={reviews} />
              </div>
            </div>

            {/* Right Panel - Selected Meal */}
            <div className="lg:col-span-7">
              {selectedMeal ? (
                <div className="bg-white rounded-2xl shadow border overflow-hidden">
                  <div className="relative h-96">
                    <img
                      src={selectedMeal.thumbnail?.url || "/meal-placeholder.jpg"}
                      alt={selectedMeal.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-8 left-8 text-white">
                      <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm">
                        {selectedMeal.type}
                      </span>
                      <h2 className="text-4xl font-bold mt-4">{selectedMeal.title}</h2>
                      <p className="text-lg mt-2 max-w-lg">{selectedMeal.description}</p>
                    </div>
                  </div>

                  {/* Macros & Info */}
                  <div className="p-6 space-y-6">
                    <div className="flex flex-wrap gap-4 justify-between">
                      <div className="flex flex-wrap gap-4">
                        <MacroBubble label="Calories" value={selectedMeal.nutrition?.calories || 0} unit="cal" />
                        <MacroBubble label="Protein" value={selectedMeal.nutrition?.protein || 0} unit="g" />
                        <MacroBubble label="Carbs" value={selectedMeal.nutrition?.carbs || 0} unit="g" />
                        <MacroBubble label="Fat" value={selectedMeal.nutrition?.fat || 0} unit="g" />
                      </div>
                      <div className="flex items-center gap-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={18} /> {selectedMeal.prepTime || "15"} min prep
                        </div>
                        <div className="flex items-center gap-2">
                          <Flame size={18} /> {selectedMeal.difficulty || "Easy"}
                        </div>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="border rounded-2xl p-5">
                          <h4 className="font-bold text-lg mb-4">Ingredients</h4>
                          <ul className="grid sm:grid-cols-2 gap-3">
                            {selectedMeal.ingredients?.map((ing, i) => (
                              <li key={i} className="flex items-center gap-3 text-gray-700">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                {ing}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border rounded-2xl p-5">
                          <h4 className="font-bold text-lg mb-4">Instructions</h4>
                          <ol className="space-y-4">
                            {selectedMeal.instructions?.map((step, i) => (
                              <li key={i} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center flex-shrink-0">
                                  {i + 1}
                                </div>
                                <p className="text-gray-700 pt-2">{step}</p>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="border rounded-2xl p-5">
                          <h4 className="font-bold text-lg mb-3">Nutrition Facts</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span>Calories</span><strong>{selectedMeal.nutrition?.calories} cal</strong></div>
                            <div className="flex justify-between"><span>Protein</span><strong>{selectedMeal.nutrition?.protein} g</strong></div>
                            <div className="flex justify-between"><span>Carbs</span><strong>{selectedMeal.nutrition?.carbs} g</strong></div>
                            <div className="flex justify-between"><span>Fat</span><strong>{selectedMeal.nutrition?.fat} g</strong></div>
                          </div>
                        </div>

                        <div className="border rounded-2xl p-5">
                          <h4 className="font-bold text-lg mb-3">Notes & Tips</h4>
                          {selectedMeal.notes?.length > 0 ? (
                            <ul className="space-y-2 text-sm text-gray-700">
                              {selectedMeal.notes.map((note, i) => (
                                <li key={i} className="flex gap-2">
                                  <Info size={16} className="text-blue-500 mt-0.5" />
                                  {note}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400 text-sm">No additional notes</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex gap-4">
                        <button
                          onClick={() => completeMeal(selectedMeal)}
                          className={`px-6 py-3 rounded-full font-bold transition ${
                            completedMealIds.includes(selectedMeal._id)
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                          style={{ background: completedMealIds.includes(selectedMeal._id) ? "#16a34a" : THEME }}
                        >
                          {completedMealIds.includes(selectedMeal._id) ? "Completed ✓" : "Mark as Done"}
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Star className="text-yellow-500 fill-current" size={18} />
                        4.8 • 220 reviews
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-16 text-center shadow border">
                  <div className="text-gray-400">
                    <Utensils size={64} className="mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">Rest Day</h3>
                    <p className="mt-2">Enjoy your break — no meals scheduled today.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}