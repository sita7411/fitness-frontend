
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
import { Play, Pause, RotateCcw } from "lucide-react";
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
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-shadow hover:shadow-md ${selected ? "ring-2 ring-red-500 bg-red-50" : "bg-white border-gray-100"
        }`}
    >
      <img
        src={meal.thumbnail?.url || "/meal-1.jpg"}
        alt={meal.title}
        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold text-gray-800 truncate">{meal.title}</div>
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {meal.type ? meal.type.charAt(0).toUpperCase() + meal.type.slice(1) : "Meal"}
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-1 flex gap-3 flex-wrap">
          <span className="whitespace-nowrap">{meal.nutrition?.calories || 0} cal</span>
          <span className="whitespace-nowrap">{meal.nutrition?.protein || 0}g P</span>
          <span className="whitespace-nowrap">{meal.nutrition?.carbs || 0}g C</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(meal);
          }}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${completed ? "bg-green-600 text-white" : "bg-white border text-gray-600"
            }`}
        >
          {completed ? (
            <span className="flex items-center gap-1">
              <CheckCircle size={14} /> Done
            </span>
          ) : (
            "Mark"
          )}
        </button>
      </div>
    </motion.div>
  );
}

function WaterTracker({ value, setCups }) {
  const cupsTotal = 8;
  const mlPerCup = 240;
  const filled = Math.max(0, Math.min(cupsTotal, value));

  const updateWater = async (increment) => {
    try {
      await axios.post(
        "http://localhost:5000/api/stats/water",
        { increment },
        { withCredentials: true }
      );
      setCups((prev) => prev + increment);
      toast.success(increment > 0 ? "+1 Glass Added" : "Glass Removed");
    } catch (err) {
      toast.error("Water update failed");
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Hydration</h4>
        <div className="text-sm text-gray-500">
          {filled * mlPerCup} / {cupsTotal * mlPerCup} ml
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 grid grid-cols-8 gap-2">
          {Array.from({ length: cupsTotal }).map((_, i) => (
            <div
              key={i}
              className={`h-10 rounded-md border flex flex-col items-center justify-center transition ${i < filled ? "bg-blue-100 border-blue-200" : "bg-gray-50 border-gray-200"
                }`}
            >
              <Droplet
                size={16}
                className={`${i < filled ? "text-blue-600" : "text-gray-300"}`}
              />
              <span className="text-xs text-gray-500 mt-1">{mlPerCup} ml</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => updateWater(-1)}
          className="flex-1 px-3 py-2 rounded-full border text-sm"
        >
          - Remove
        </button>
        <button
          onClick={() => updateWater(1)}
          className="flex-1 px-3 py-2 rounded-full text-sm"
          style={{ background: THEME, color: "#fff" }}
        >
          + Add
        </button>
      </div>
    </div>
  );
}

function WeeklyMacroSummary({ data = [] }) {
  if (!data || data.length === 0 || data.every(d => d === 0)) {
    return (
      <div className="bg-white border rounded-2xl p-4 shadow-sm text-center text-gray-400">
        No calorie data this week yet
      </div>
    );
  }

  const max = Math.max(...data, 1);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Weekly Calories</h4>
        <div className="text-sm text-gray-500">kcal</div>
      </div>
      <div className="space-y-3">
        {data.map((calories, i) => {
          const percent = (calories / max) * 100;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 text-xs font-medium text-gray-600">
                {dayLabels[i]}
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: i === 6 ? THEME : "#fca5a5",
                  }}
                />
              </div>
              <div className="w-16 text-right text-sm font-medium text-gray-800">
                {calories}
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
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Member Reviews</h4>
        <div className="text-sm text-gray-500">{reviews.length} reviews</div>
      </div>
      <div className="mt-3 space-y-3">
        {reviews.slice(0, 3).map((r, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
              {r.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-sm text-gray-500">{r.rating} stars</div>
              </div>
              <div className="text-xs text-gray-600 mt-1 line-clamp-2">{r.comment}</div>
            </div>
          </div>
        ))}
        <button className="w-full text-sm px-3 py-2 rounded-full border">See all reviews</button>
      </div>
    </div>
  );
}

function GroceryListModal({ open, onClose, items, onCopy, onDownloadTxt, onDownloadCsv }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-red-600" />
                <h3 className="text-lg font-semibold">Grocery List</h3>
                <div className="text-sm text-gray-500">• {items.length} items</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onCopy}
                  className="px-3 py-1 rounded-full border text-sm inline-flex items-center gap-2"
                >
                  <Copy size={14} /> Copy
                </button>
                <button
                  onClick={onDownloadTxt}
                  className="px-3 py-1 rounded-full border text-sm inline-flex items-center gap-2"
                >
                  <Download size={14} /> TXT
                </button>
                <button
                  onClick={onDownloadCsv}
                  className="px-3 py-1 rounded-full border text-sm inline-flex items-center gap-2"
                >
                  <Download size={14} /> CSV
                </button>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-center text-gray-500 py-6">No ingredients found for this day.</div>
              ) : (
                <ul className="divide-y">
                  {items.map((it, i) => (
                    <li key={i} className="py-3 flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{it.name}</div>
                        <div className="text-xs text-gray-500 mt-1">Found in {it.count} meal(s)</div>
                      </div>
                      <div className="text-sm text-gray-700">{it.count > 1 ? `${it.count}x` : ""}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-500">Tip: edit items before downloading for exact quantities.</div>
              <div>
                <button onClick={onClose} className="px-4 py-2 rounded-full border text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function NutritionPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [completedMeals, setCompletedMeals] = useState([]); // Loaded from backend
  const [cups, setCups] = useState(0);
  const [filter, setFilter] = useState("All");
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [groceryItems, setGroceryItems] = useState([]);
  const [weeklyCalories, setWeeklyCalories] = useState([0, 0, 0, 0, 0, 0, 0]);

  const DEFAULT_PREP_MIN = 10;
  const DEFAULT_COOK_MIN = 20;
  // ================= TIMER LOGIC =================
  const getMinutes = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const match = value.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    }
    return 0;
  };
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Countdown
  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          toast.success("⏰ Cooking completed!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  // ================= TIMER LOGIC END =================

  const completeMeal = async (meal) => {
    if (!meal?._id || !currentPlan?._id || selectedDayIndex === undefined) {
      toast.error("Missing data");
      return;
    }

    if (completedMeals.includes(meal._id)) {
      toast.info("Already marked as done!");
      return;
    }

    try {
      // 1. Daily stats ke liye calories add karo (existing)
      await axios.post(
        "http://localhost:5000/api/stats/meal",
        {
          mealId: meal._id,
          calories: meal.nutrition?.calories || 0,
          protein: meal.nutrition?.protein || 0,
          carbs: meal.nutrition?.carbs || 0,
          fats: meal.nutrition?.fat || 0,
        },
        { withCredentials: true }
      );

      // 2. Permanent progress save karo
      await axios.post(
        "http://localhost:5000/api/nutrition/mark-meal-complete",
        {
          mealId: meal._id,
          planId: currentPlan._id,
          dayIndex: selectedDayIndex,
        },
        { withCredentials: true }
      );

      // Update local state
      setCompletedMeals((prev) => [...prev, meal._id]);
      toast.success("Meal marked as done permanently!");
    } catch (err) {
      toast.error("Failed to save progress");
    }
  };

  useEffect(() => {
  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [plansRes, todayStatsRes, weeklyRes, userRes] = await Promise.all([
        axios.get("http://localhost:5000/api/nutrition/my/plans", { withCredentials: true }),
        axios.get("http://localhost:5000/api/stats/today", { withCredentials: true }),
        axios.get("http://localhost:5000/api/stats/weekly", { withCredentials: true }),
        axios.get("http://localhost:5000/api/auth/me", { withCredentials: true }),
      ]);

      // Plans set karo
      const userPlans = plansRes.data.plans || [];
      setPlans(userPlans);

      // Pehla plan select karo agar available hai
      if (userPlans.length > 0) {
        setSelectedPlanId(userPlans[0]._id);
      }

      // Stats set karo
      setCups(todayStatsRes.data.water || 0);

      const weeklyData = weeklyRes.data;
      const caloriesArray = Array.isArray(weeklyData)
        ? weeklyData.map(item => item.calories || 0)
        : [0, 0, 0, 0, 0, 0, 0];
      setWeeklyCalories(caloriesArray.length === 7 ? caloriesArray : [0, 0, 0, 0, 0, 0, 0]);

      // Completed meals load karo (agar plan hai toh)
      if (userPlans.length > 0) {
        const planId = userPlans[0]._id;
        const userProgress = userRes.data.user?.nutritionProgress || [];
        const currentPlanProgress = userProgress.find(
          p => p.planId?.toString() === planId?.toString()
        );

        if (currentPlanProgress) {
          const completedIds = currentPlanProgress.completedMeals.map(cm => cm.mealId?.toString());
          setCompletedMeals(completedIds);
        } else {
          setCompletedMeals([]);
        }
      }

    } catch (err) {
      console.error("Initial load error:", err);
      toast.error("Failed to load nutrition dashboard");
    } finally {
      setLoading(false); // ← YE HAMESHA CHALEGA, CHAHE ERROR HO YA SUCCESS
    }
  };

  fetchInitialData();
}, []); // ← Empty dependency → sirf ek baar page load pe chalega
  useEffect(() => {
    if (!loading && plans.length > 0 && selectedPlanId) {
      const plan = plans.find((p) => p._id === selectedPlanId);
      const day = plan?.days?.[selectedDayIndex];
      const firstMeal = day?.meals?.[0];
      if (firstMeal) setSelectedMealId(firstMeal._id);
    }
  }, [selectedDayIndex, selectedPlanId, plans, loading]);

  const currentPlan = plans.find((p) => p._id === selectedPlanId) || plans[0] || {};
  const days = currentPlan?.days || [];
  const currentDay = days[selectedDayIndex] || { meals: [] };

  const filteredMeals =
    filter === "All"
      ? currentDay.meals || []
      : (currentDay.meals || []).filter(
        (m) => m.type?.toLowerCase() === filter.toLowerCase()
      );

  // ✅ YAHI FIX HAI
  const selectedMeal =
    currentDay.meals?.find((m) => m._id === selectedMealId)
    || filteredMeals[0]
    || null;
  useEffect(() => {
    if (!selectedMeal) {
      setTimeLeft(0);
      setTimerRunning(false);
      return;
    }

    const prep = getMinutes(selectedMeal.prepTime) || DEFAULT_PREP_MIN;
    const cook = getMinutes(selectedMeal.cookTime) || DEFAULT_COOK_MIN;

    setTimeLeft((prep + cook) * 60);
    setTimerRunning(false);
  }, [selectedMeal]);


  const totalMeals = currentDay.meals?.length || 0;
  const completedCount = currentDay.meals?.filter(m =>
    completedMeals.includes(m._id)
  ).length || 0;
  const progress = totalMeals > 0 ? completedCount / totalMeals : 0;

  const reviews = [
    { name: "Asha P.", initials: "AP", rating: 5, comment: "Great plan — easy to follow and tasty!" },
    { name: "Ravi K.", initials: "RK", rating: 5, comment: "Helped me hit my protein goal every day." },
    { name: "Neha S.", initials: "NS", rating: 4.5, comment: "Lovely recipes and clear steps." },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Apple className="w-16 h-16 mx-auto text-red-600 animate-bounce" />
          <p className="mt-6 text-xl font-semibold text-gray-700">Loading your nutrition dashboard...</p>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <Lock className="w-24 h-24 mx-auto text-gray-400 mb-6" />
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">No Nutrition Plan Active</h2>
          <p className="text-gray-600 text-lg mb-10">
            Purchase a nutrition plan to get daily meals, recipes, macros, and personalized guidance.
          </p>
          <a
            href="/nutrition-plans"
            className="inline-flex items-center gap-3 px-10 py-5 bg-red-600 text-white text-lg font-bold rounded-full hover:bg-red-700 transition shadow-lg"
          >
            <Apple className="w-8 h-8" />
            Explore Nutrition Plans
          </a>
        </div>
      </div>
    );
  }


  const buildGroceryListFromDay = (day) => {
    const map = {};
    (day?.meals || []).forEach((meal) => {
      (meal.ingredients || []).forEach((ing) => {
        const key = (ing || "").trim();
        if (!key) return;
        map[key] = (map[key] || 0) + 1;
      });
    });

    return Object.keys(map)
      .map((k) => ({ name: k, count: map[k] }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  };

  const openGroceryModal = () => {
    const items = buildGroceryListFromDay(currentDay);
    setGroceryItems(items);
    setShowGroceryModal(true);
  };

  const handleCopyGrocery = async () => {
    try {
      const text = groceryItems.map((i) => `- ${i.name} ${i.count > 1 ? `(${i.count}x)` : ""}`).join("\n");
      await navigator.clipboard.writeText(text);
      toast.success("Copied grocery list to clipboard");
    } catch (err) {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleDownloadTxt = () => {
    const header = `Grocery List — ${currentPlan.title || "Plan"} — Day ${currentDay.day || selectedDayIndex + 1}\n\n`;
    const body = groceryItems.map((i) => `- ${i.name} ${i.count > 1 ? `(${i.count}x)` : ""}`).join("\n");
    const blob = new Blob([header + body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grocery-day-${selectedDayIndex + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded TXT");
  };

  const handleDownloadCsv = () => {
    const rows = [["item", "count"]];
    groceryItems.forEach((it) => rows.push([`"${it.name.replace(/"/g, '""')}"`, it.count]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grocery-day-${selectedDayIndex + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded CSV");
  };

  return (
    <>
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
      <div className="min-h-screen bg-white rounded-lg p-4 md:p-8">
        <GroceryListModal
          open={showGroceryModal}
          onClose={() => setShowGroceryModal(false)}
          items={groceryItems}
          onCopy={handleCopyGrocery}
          onDownloadTxt={handleDownloadTxt}
          onDownloadCsv={handleDownloadCsv}
        />

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">My Nutrition </h1>
              <p className="text-gray-500 mt-1 max-w-2xl">
                Daily meal guidance, macros, and full recipes — designed for members. Follow the plan,
                mark meals done, and track progress.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Plan: <span className="font-medium text-gray-800">{currentPlan.title}</span>
              </div>
            </div>
          </div>

          {/* Plan carousel */}
          <div className="grid grid-cols-3 gap-4 pb-3">
            {plans.map((plan) => (
              <div
                key={plan._id}
                onClick={() => {
                  setSelectedPlanId(plan._id);
                  setSelectedDayIndex(0);
                }}
                className={`flex-shrink-0 w-64 rounded-2xl cursor-pointer overflow-hidden border transition-shadow ${plan._id === selectedPlanId ? "ring-2 ring-red-600 shadow-lg" : "border-gray-100"
                  }`}
              >
                <div className="relative h-36 w-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <img
                    src={plan.coverImage?.url || "/meal-1.jpg"}
                    alt={plan.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 bg-white">
                  <div className="text-sm text-gray-500">{plan.days?.length || 0} Days</div>
                  <div className="text-xs text-gray-400 mt-1 line-clamp-2">{plan.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Day Selector */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {days.map((d, idx) => {
              const status = (d.meals || []).length === 0 ? "rest" : "active";
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-4 py-2 rounded-full shadow-sm border whitespace-nowrap transition ${isSelected
                    ? "bg-red-600 text-white"
                    : status === "active"
                      ? "bg-white text-gray-700"
                      : "bg-gray-100 text-gray-500"
                    }`}
                  style={isSelected ? { background: THEME } : {}}
                >
                  Day {d.day || idx + 1}
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {["All", "Breakfast", "Lunch", "Dinner", "Snack"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full border text-sm transition ${filter === f ? "bg-red-600 text-white" : "bg-white text-gray-700"
                  }`}
                style={filter === f ? { background: THEME } : {}}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Main layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-2">
            {/* Left */}
            <div className="md:col-span-5 flex flex-col gap-4">
              {/* Meal Progress */}
              <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Meal Progress</h3>
                  <button className="text-xs bg-gray-100 px-3 py-1 rounded-full">Today</button>
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <svg width="150" height="150" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" stroke="#eee" strokeWidth="10" fill="none" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke={THEME}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${progress * 314} 314`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                </div>
                <div className="text-center -mt-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(progress * 100)}%
                  </p>
                  <p className="text-sm text-gray-500">Meals Completed</p>
                </div>
                <div className="mt-4 space-y-3">
                  {currentDay.meals?.map((meal) => (
                    <div key={meal._id} className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            background: completedMeals.includes(meal._id) ? "#16a34a" : THEME,
                          }}
                        ></div>
                        <span className="text-sm text-gray-700">{meal.title}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {completedMeals.includes(meal._id) ? "100%" : "0%"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Day {selectedDayIndex + 1} • {currentDay.title || "Daily Meals"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {currentDay.meals?.length > 0
                        ? `${currentDay.meals.length} meals • Balanced macros`
                        : "Rest day — enjoy your break!"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500 text-right">
                      <div>Target</div>
                      <div className="font-semibold text-gray-800">2000 kcal</div>
                    </div>
                    <button
                      onClick={openGroceryModal}
                      className="ml-3 inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm"
                      title="Generate grocery list for this day"
                    >
                      <ShoppingCart size={16} className="text-red-600 whitespace-nowrap" /> Grocery List
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow border border-gray-100 max-h-[420px] overflow-y-auto">
                <div className="space-y-3">
                  {filteredMeals.length === 0 ? (
                    <div className="py-10 text-center text-gray-500">Rest day — no meals planned.</div>
                  ) : (
                    filteredMeals.map((meal) => (
                      <MealListItem
                        key={meal._id}
                        meal={meal}
                        selected={meal._id === selectedMealId}
                        completed={completedMeals.includes(meal._id)}
                        onSelect={setSelectedMealId}
                        onToggleComplete={completeMeal}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <WaterTracker value={cups} setCups={setCups} />
                <WeeklyMacroSummary data={weeklyCalories} />
                <ReviewsBox reviews={reviews} />
              </div>
            </div>

            {/* Right */}
            <div className="md:col-span-7 bg-white rounded-2xl p-6 shadow border border-gray-100 flex flex-col gap-4">
              {selectedMeal ? (
                <>
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="w-full h-64 md:h-80 object-cover rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                      <img
                        src={selectedMeal.thumbnail?.url || "/meal-1.jpg"}
                        alt={selectedMeal.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl" />
                    <div className="absolute left-6 bottom-6 text-white max-w-[75%]">
                      <div className="text-sm bg-white/10 px-3 py-1 rounded-full inline-flex items-center gap-2">
                        <span className="text-xs opacity-80">{selectedMeal.type}</span>
                      </div>
                      <h2 className="text-2xl font-bold mt-2 text-white">{selectedMeal.title}</h2>
                      <p className="text-sm text-white/90 mt-1 line-clamp-3">{selectedMeal.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex gap-3 items-center flex-wrap">
                      <MacroBubble label="Calories" value={selectedMeal.nutrition?.calories || 0} unit="cal" />
                      <MacroBubble label="Protein" value={`${selectedMeal.nutrition?.protein || 0}g`} />
                      <MacroBubble label="Carbs" value={`${selectedMeal.nutrition?.carbs || 0}g`} />
                      <MacroBubble label="Fat" value={`${selectedMeal.nutrition?.fat || 0}g`} />
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-gray-600 ">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Clock size={16} />
                        <span className="font-medium">Total Time:</span>
                        <span>
                          {selectedMeal.totalTime
                            ? `${selectedMeal.totalTime} min`
                            : `${(getMinutes(selectedMeal.prepTime) || 10) + (getMinutes(selectedMeal.cookTime) || 20)} min`
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Flame size={16} />
                        <span className="font-medium">Difficulty:</span>
                        <span>{selectedMeal.difficulty || "Easy"}</span>
                      </div>

                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Utensils size={16} />
                        <span className="font-medium">Meal Type:</span>
                        <span>{selectedMeal.mealType || "Veg"}</span>
                      </div>
                    </div>


                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-white border rounded-2xl p-4 shadow-sm">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <Clock size={16} className="text-red-600" />
                          Cooking Timer
                        </h5>

                        <div className="text-3xl font-bold text-center my-4">
                          {formatTime(timeLeft)}
                        </div>

                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => setTimerRunning(true)}
                            className="px-4 py-2 rounded-full bg-green-600 text-white text-sm flex items-center gap-2"
                          >
                            <Play size={16} /> Start
                          </button>

                          <button
                            onClick={() => setTimerRunning(false)}
                            className="px-4 py-2 rounded-full bg-yellow-500 text-white text-sm flex items-center gap-2"
                          >
                            <Pause size={16} /> Pause
                          </button>

                          <button
                            onClick={() => {
                              if (!selectedMeal) {
                                setTimeLeft(30 * 60);
                              } else {
                                const prep = getMinutes(selectedMeal.prepTime);
                                const cook = getMinutes(selectedMeal.cookTime);
                                setTimeLeft((prep + cook || 30) * 60);
                              }
                              setTimerRunning(false);
                            }}
                            className="px-4 py-2 rounded-full border text-sm flex items-center gap-2"
                          >
                            <RotateCcw size={16} /> Reset
                          </button>
                        </div>
                      </div>

                      <div className="bg-white border rounded-2xl p-4 shadow-sm">
                        <h4 className="font-semibold mb-3">Ingredients</h4>
                        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-1 gap-2 text-gray-700">
                          {selectedMeal.ingredients?.map((ing, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm text-red-600">•</div>
                              <div className="text-sm">{ing}</div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white border rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Directions</h4>
                          <div className="text-sm text-gray-500">{selectedMeal.instructions?.length || 0} steps</div>
                        </div>
                        <div className="mt-3 space-y-3">
                          {selectedMeal.instructions?.map((step, i) => (
                            <div key={i} className="flex gap-3 items-start  p-3 rounded-xl border bg-gray-50">
                              <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 font-semibold flex items-center justify-center">
                                {i + 1}
                              </div>
                              <div className="text-sm mt-1 text-gray-700">{step}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white border rounded-2xl p-4 shadow-sm">
                        <h5 className="font-semibold mb-2">Tools & Equipment</h5>
                        <ul className="text-sm text-gray-700 space-y-2">
                          {selectedMeal.tools?.map((t, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                              {t}
                            </li>
                          )) || <li className="text-gray-400">No tools listed</li>}
                        </ul>
                      </div>

                      <div className="bg-white border rounded-2xl p-4 shadow-sm">
                        <h5 className="font-semibold mb-2">Notes</h5>
                        <ul className="text-sm text-gray-700 space-y-2">
                          {selectedMeal.notes?.map((n, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Info size={16} className="text-gray-400 mt-1" />
                              <div>{n}</div>
                            </li>
                          )) || <li className="text-gray-400">No notes</li>}
                        </ul>
                      </div>

                      <div className="bg-gray-50 border rounded-2xl p-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold">Nutrition Facts</h5>
                          <div className="text-sm text-gray-500">Per Serving</div>
                        </div>
                        <div className="mt-3 text-sm text-gray-700 space-y-2">
                          <div className="flex justify-between">
                            <span>Calories</span>
                            <span className="font-semibold">{selectedMeal.nutrition?.calories || 0} cal</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Protein</span>
                            <span className="font-semibold">{selectedMeal.nutrition?.protein || 0} g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Carbohydrates</span>
                            <span className="font-semibold">{selectedMeal.nutrition?.carbs || 0} g</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Fat</span>
                            <span className="font-semibold">{selectedMeal.nutrition?.fat || 0} g</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => completeMeal(selectedMeal)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition ${completedMeals.includes(selectedMeal._id)
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                          }`}
                        style={{
                          background: completedMeals.includes(selectedMeal._id) ? "#16a34a" : THEME,
                        }}
                      >
                        {completedMeals.includes(selectedMeal._id) ? "Completed" : "Mark as Done"}
                      </button>
                      <button className="px-4 py-2 rounded-full border text-sm text-gray-700">Save</button>
                      <button
                        onClick={() => setTimerRunning(true)}
                        className="px-4 py-2 rounded-full border text-sm text-gray-700 hidden md:inline-flex"
                      >
                        Start Cook
                      </button>

                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Star size={16} className="text-yellow-400" /> <span>4.8 • 220 reviews</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-gray-500">
                  <h2 className="text-2xl font-bold">Rest Day</h2>
                  <p className="mt-2 text-center">No meals planned for this day — enjoy your break!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}