import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import {
  Droplet,
  Flame,
  Activity,
  CheckCircle2,
  Target,
  HeartPulse,
  Dumbbell,
  Clock,
  Calendar,
  Footprints,
  StretchHorizontal,
  Users,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardHome() {
  const theme = "#e3002a";
  const bgLight = "rgba(227,0,42,0.12)";
  const cardStyle = { boxShadow: "0 6px 18px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", height: 165 };

  const [latestSession, setLatestSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // NEW: Recent Activity from Notifications
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const [todayStats, setTodayStats] = useState({
    water: 2.1,
    calories: 2500,
    steps: 8200,
    heartRate: 0,
    yesterdayCalories: null,
    dailyGoals: [],
  });

  // Fetch all data including notifications for Recent Activity
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [weeklyRes, todayRes, sessionRes, scheduleRes, notificationsRes] = await Promise.all([
          axios.get("/api/stats/weekly", { withCredentials: true }),
          axios.get("/api/stats/today", { withCredentials: true }),
          axios.get("/api/stats/latest-session", { withCredentials: true }),
          axios.get("/api/stats/today-schedule", { withCredentials: true }),
          axios.get("http://localhost:5000/api/notifications", { withCredentials: true }), // Same API as FitnessNotifications
        ]);

        // Weekly Data
        if (weeklyRes.data?.length === 7) {
          setWeeklyData(
            weeklyRes.data.map((d) => ({
              day: d.day,
              workoutMinutes: d.workoutMinutes || 0,
              calories: d.calories || 0,
              weight: d.weight || 0,
              steps: d.steps || 0,
              protein: d.protein || 0,
              carbs: d.carbs || 0,
              fats: d.fats || 0,
            }))
          );
        }

        // Today Stats
        if (todayRes.data) {
          setTodayStats({
            water: todayRes.data.water || 0,
            calories: todayRes.data.calories || 0,
            steps: todayRes.data.steps || 0,
            heartRate: todayRes.data.averageHeartRate || 78,
            yesterdayCalories: todayRes.data.yesterdayCalories,
            dailyGoals: todayRes.data.dailyGoals || [],
          });
        }

        // Latest Session
        if (sessionRes?.data?.found) {
          setLatestSession(sessionRes.data);
        } else {
          setLatestSession(null);
        }

        // Today's Schedule
        if (scheduleRes.data?.success) {
          setTodaySchedule(scheduleRes.data.schedule || []);
        } else {
          setTodaySchedule([]);
        }

        // Recent Activity → Latest 4 notifications
        if (notificationsRes.data.success && Array.isArray(notificationsRes.data.notifications)) {
          const latestNotifications = notificationsRes.data.notifications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4);

          setRecentActivity(latestNotifications);
        } else {
          setRecentActivity([]);
        }

        setSessionLoading(false);
        setScheduleLoading(false);
        setActivityLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setTodaySchedule([]);
        setRecentActivity([]);
        setSessionLoading(false);
        setScheduleLoading(false);
        setActivityLoading(false);
      }
    };

    fetchAll();
  }, []);

  const caloriesData = {
    labels: weeklyData.map((d) => d.day),
    datasets: [
      { label: "Calories", data: weeklyData.map((d) => d.calories), backgroundColor: theme },
      { label: "Proteins (g)", data: weeklyData.map((d) => d.protein), backgroundColor: "#f7c1c9" },
      { label: "Fats (g)", data: weeklyData.map((d) => d.fats), backgroundColor: "#e3a500" },
      { label: "Carbs (g)", data: weeklyData.map((d) => d.carbs), backgroundColor: "#a0d911" },
    ],
  };

  const caloriesOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { boxWidth: 12, boxHeight: 12, padding: 15, color: "#374151", font: { size: 12, weight: "500" } } },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#111827",
        borderColor: "#e3002a",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
        caretPadding: 6,
        callbacks: {
          title: (items) => `Day: ${items[0].label}`,
          label: (item) => {
            const label = item.dataset.label;
            const value = item.parsed.y;
            const unit = label === "Calories" ? " kcal" : label.includes("g") ? " g" : "";
            return `${label}: ${value}${unit}`;
          },
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      y: { beginAtZero: true, ticks: { color: "#6B7280", font: { size: 12 } }, grid: { color: "#F3F4F6", drawBorder: false } },
      x: { ticks: { color: "#6B7280", font: { size: 12 } }, grid: { display: false } },
    },
  };

  const [hoverInfo, setHoverInfo] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const chartRef = useRef(null);

  const view = { w: 300, h: 120, paddingX: 20, paddingY: 20 };
  const getX = (idx) => view.paddingX + (idx * (view.w - view.paddingX * 2)) / (weeklyData.length - 1 || 1);
  const getY = (val) => {
    const minutes = weeklyData.map((d) => d.workoutMinutes || 0);
    const min = Math.min(...minutes, 0);
    const max = Math.max(...minutes, 1);
    const current = val || 0;
    const pct = max === min ? 0.5 : (current - min) / (max - min);
    return view.h - view.paddingY - pct * (view.h - view.paddingY * 2);
  };

  const buildPath = () => {
    if (!weeklyData.length) return "";
    const pts = weeklyData.map((d, i) => ({ x: getX(i), y: getY(d.workoutMinutes) }));
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  };
  const pathD = buildPath();

  const handlePointEnter = (evt, idx) => {
    const rect = chartRef.current?.getBoundingClientRect();
    const x = rect ? evt.clientX - rect.left : evt.clientX;
    const y = rect ? evt.clientY - rect.top : evt.clientY;
    setHoverPos({ x, y });
    setHoverInfo({ idx, ...weeklyData[idx] });
  };
  const handlePointMove = (evt) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoverPos({ x: evt.clientX - rect.left, y: evt.clientY - rect.top });
  };
  const handlePointLeave = () => setHoverInfo(null);

  // Icon mapping for notifications in Recent Activity
  const getNotificationIcon = (notif) => {
    const iconMap = {
      workout: Dumbbell,
      success: CheckCircle2,
      error: AlertTriangle,
      neutral: Activity,
      bell: Zap,
    };

    return (
      iconMap[notif.icon] ||
      iconMap[notif.type] ||
      (notif.title.toLowerCase().includes("water") ? Droplet :
       notif.title.toLowerCase().includes("step") ? Footprints :
       notif.title.toLowerCase().includes("stretch") ? StretchHorizontal :
       Zap)
    );
  };

  return (
    <div className="p-5 bg-white w-full rounded-lg">
      <div className="max-w-6xl mx-auto">
        {/* TOP 4 CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Water */}
          <div className="bg-white rounded-xl p-4" style={cardStyle}>
            <div className="flex justify-between items-center">
              <p className="text-gray-900 font-semibold text-[15px]">Water</p>
              <div className="rounded-lg p-2" style={{ background: bgLight }}><Droplet size={18} color={theme} /></div>
            </div>
            <div className="flex items-end gap-1">
              <h1 className="text-[30px] font-bold text-gray-900 leading-none">{todayStats.water}</h1>
              <span className="text-gray-500 text-xs mb-[4px]">Liters</span>
            </div>
            <div className="mt-2">
              <svg width="100%" height="42" viewBox="0 0 300 64" preserveAspectRatio="none">
                <path d="M0 38 C 30 28, 80 46, 120 34 C 150 25, 190 40, 240 34 L300 34 L300 64 L0 64 Z" fill="#ffe5e8" />
                <path d="M0 38 C 30 28, 80 46, 120 34 C 150 25, 190 40, 240 34" fill="none" stroke={theme} strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[11px] mt-1 text-gray-600 flex items-center gap-1">
              <span className="px-1.5 py-[2px] rounded-full font-medium" style={{ background: bgLight, color: theme }}>
                {Math.round((todayStats.water / 3) * 100)}%
              </span>
              of 3L goal
            </p>
          </div>

          {/* Calories */}
          <div className="bg-white rounded-xl p-4" style={cardStyle}>
            <div className="flex justify-between items-center">
              <p className="text-gray-900 font-semibold text-[15px]">Calories</p>
              <div className="rounded-lg p-2" style={{ background: bgLight }}><Flame size={18} color={theme} /></div>
            </div>
            <div className="mt-2 flex items-end gap-1">
              <h1 className="text-[30px] font-bold text-gray-900 leading-none">
                {todayStats.calories > 999 ? (todayStats.calories / 1000).toFixed(1) + "K" : todayStats.calories}
              </h1>
              <span className="text-gray-500 text-xs mb-[4px]">kcal</span>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 26,
                    height: 18,
                    background: i < Math.ceil(todayStats.calories / 500) ? theme : "#e5e7eb",
                  }}
                  className="rounded-md transition-all duration-500"
                />
              ))}
            </div>
            <p className="text-[11px] mt-3 text-gray-600 flex items-center gap-1">
              <span
                className="px-1.5 py-[2px] rounded-full font-medium text-white"
                style={{
                  background: todayStats.yesterdayCalories === null ? bgLight : todayStats.calories > todayStats.yesterdayCalories ? "#10b981" : "#ef4444",
                  color: "white",
                }}
              >
                {todayStats.yesterdayCalories === null
                  ? "New"
                  : todayStats.calories > todayStats.yesterdayCalories
                  ? `+${Math.round(((todayStats.calories - todayStats.yesterdayCalories) / todayStats.yesterdayCalories) * 100)}%`
                  : `${Math.round(((todayStats.calories - todayStats.yesterdayCalories) / todayStats.yesterdayCalories) * 100)}%`}
              </span>
              vs yesterday
            </p>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-xl p-4" style={cardStyle}>
            <div className="flex justify-between items-center">
              <p className="text-gray-900 font-semibold text-[15px]">Step Goals</p>
              <div className="rounded-lg p-2" style={{ background: bgLight }}><Activity size={18} color={theme} /></div>
            </div>
            <div className="-mt-17 flex justify-center">
              <svg width="390" height="230" viewBox="0 0 220 120" preserveAspectRatio="xMidYMid meet">
                {Array.from({ length: 26 }).map((_, idx) => (
                  <line
                    key={idx}
                    x1={110 + 60 * Math.cos(Math.PI + (idx / 26) * Math.PI)}
                    y1={95 + 60 * Math.sin(Math.PI + (idx / 26) * Math.PI)}
                    x2={110 + 48 * Math.cos(Math.PI + (idx / 26) * Math.PI)}
                    y2={95 + 48 * Math.sin(Math.PI + (idx / 26) * Math.PI)}
                    stroke={idx < Math.round((todayStats.steps / 15000) * 26) ? theme : "#E5E7EB"}
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                ))}
              </svg>
            </div>
            <p className="text-center text-[13px] font-semibold -mt-24 text-gray-900">
              {Math.round((todayStats.steps / 15000) * 100)}%
            </p>
            <p className="text-center text-[11px] text-gray-600">Daily target</p>
          </div>

          {/* Heart Rate */}
          <div className="bg-white rounded-xl p-4" style={cardStyle}>
            <div className="flex justify-between items-center">
              <p className="text-gray-900 font-semibold text-[15px]">Heart Rate</p>
              <div className="rounded-lg p-2" style={{ background: bgLight }}><HeartPulse size={18} color={theme} /></div>
            </div>
            <div className="mt-2 flex items-end gap-1">
              <h1 className="text-[30px] font-bold text-gray-900 leading-none">
                {typeof todayStats.heartRate === "number" ? todayStats.heartRate : 78}
              </h1>
              <span className="text-gray-500 text-xs mb-[4px]">BPM</span>
            </div>
            <div className="mt-2">
              <svg width="100%" height="42" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path d="M0 50 L40 50 L55 30 L70 70 L90 20 L110 80 L145 50 L300 50" stroke={theme} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[11px] mt-1 text-gray-600">
              {todayStats.heartRate > 100 ? "Post-workout rate" : "Normal resting rate"}
            </p>
          </div>
        </div>

        {/* WEEKLY SUMMARY + GOALS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          {/* Weekly Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2 min-h-[210px]">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-900 font-semibold">Weekly Summary</h3>
              <p className="text-sm text-gray-600">Hover data points</p>
            </div>

            <div ref={chartRef} className="relative mt-4" style={{ height: 160 }} onMouseLeave={handlePointLeave}>
              <svg viewBox={`0 0 ${view.w} ${view.h}`} width="100%" height="160" preserveAspectRatio="none" onMouseMove={handlePointMove}>
                {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
                  <line key={i} x1={view.paddingX} x2={view.w - view.paddingX} y1={view.paddingY + (1 - g) * (view.h - view.paddingY * 2)} y2={view.paddingY + (1 - g) * (view.h - view.paddingY * 2)} stroke="#f3f4f6" strokeWidth={1} />
                ))}

                {pathD && (
                  <path d={`${pathD} L ${view.w - view.paddingX},${view.h - view.paddingY} L ${view.paddingX},${view.h - view.paddingY} Z`} fill="rgba(227,0,42,0.08)" />
                )}
                <path d={pathD} fill="none" stroke={theme} strokeWidth={2} strokeLinecap="round" />

                {weeklyData.map((d, i) => {
                  const cx = getX(i);
                  const cy = getY(d.workoutMinutes);
                  return (
                    <g key={i}>
                      <circle cx={cx} cy={cy} r={9} fill="transparent" onMouseEnter={(e) => handlePointEnter(e, i)} />
                      <circle cx={cx} cy={cy} r={4} fill={theme} stroke="white" strokeWidth={1.6} />
                    </g>
                  );
                })}

                {weeklyData.map((d, i) => (
                  <text key={i} x={getX(i)} y={view.h - 2} textAnchor="middle" fontSize="9" fill="#6b7280">
                    {d.day}
                  </text>
                ))}
              </svg>

              {hoverInfo && (
                <div className="absolute pointer-events-none z-20 bg-white p-3 border border-gray-200 rounded-lg shadow-md text-xs"
                  style={{
                    left: Math.min(Math.max(hoverPos.x - 90, 8), (chartRef.current?.clientWidth || 500) - 180),
                    top: Math.max(hoverPos.y - 90, 6),
                    width: 172,
                  }}>
                  <div className="flex justify-between">
                    <p className="text-sm font-semibold text-gray-900">{hoverInfo.day}</p>
                    <span className="px-2 py-1 text-[11px] rounded-full font-medium" style={{ background: bgLight, color: theme }}>Workout</span>
                  </div>
                  <div className="mt-2 space-y-1 text-gray-700">
                    <div className="flex justify-between"><span>Workout Minutes</span><span className="font-medium">{hoverInfo.workoutMinutes} min</span></div>
                    <div className="flex justify-between"><span>Calories</span><span className="font-medium">{hoverInfo.calories} kcal</span></div>
                    <div className="flex justify-between"><span>Weight</span><span className="font-medium">{hoverInfo.weight} kg</span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between items-center text-sm text-gray-700">
              <div className="flex flex-col items-center flex-1">
                <span className="font-bold text-gray-900 text-lg">{weeklyData.reduce((a, b) => a + b.workoutMinutes, 0)} min</span>
                <span className="mt-1">Total Workout</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="font-bold text-gray-900 text-lg">{Math.round(weeklyData.reduce((a, b) => a + b.calories, 0) / 7)} kcal</span>
                <span className="mt-1">Avg Calories</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="font-bold text-gray-900 text-lg">{(weeklyData.reduce((a, b) => a + b.weight, 0) / 7).toFixed(1)} kg</span>
                <span className="mt-1">Avg Weight</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="font-bold text-gray-900 text-lg">Progress</span>
                <div className="w-full h-2 bg-gray-300 rounded-full mt-1 overflow-hidden">
                  <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${(weeklyData.filter((d) => (d.workoutMinutes || 0) > 0).length / 7) * 100}%`, background: theme }} />
                </div>
              </div>
            </div>
          </div>

          {/* Today's Goals */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden min-h-[210px]">
            <div className="absolute right-3 top-3 w-28 h-28 rounded-full" style={{ background: "rgba(227,0,42,0.18)" }} />
            <img src="/dashboard-girl.png" className="absolute -right-7 top-7 w-43" alt="runner" />
            <h3 className="text-gray-900 font-semibold text-[16px] mb-5 relative z-10">Today's Goals</h3>

            {(!todayStats.dailyGoals || todayStats.dailyGoals.length === 0) ? (
              <div className="text-center py-12 text-gray-500">
                <Target size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="font-medium">No goals yet</p>
                <p className="text-xs mt-1">Add from Challenges</p>
              </div>
            ) : (
              <div className="space-y-5 relative z-10">
                {todayStats.dailyGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id}>
                    <p className={`text-gray-800 text-sm font-medium mb-1 truncate max-w-40 ${goal.completed ? "line-through text-gray-400" : ""}`}>
                      {goal.text.length > 22 ? goal.text.slice(0, 22) + "..." : goal.text}
                    </p>
                    <div className="w-34 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: goal.completed ? "100%" : "0%" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-2 rounded-full"
                        style={{ background: theme }}
                      />
                    </div>
                    <p className="text-[12px] text-gray-500 mt-1">
                      {goal.completed ? "Goal achieved" : "Keep going"}
                    </p>
                  </div>
                ))}
                {todayStats.dailyGoals.length > 3 && (
                  <div className="text-center pt-3">
                    <p className="text-xs text-gray-500 font-medium">+{todayStats.dailyGoals.length - 3} more goals</p>
                  </div>
                )}
              </div>
            )}

            {todayStats.dailyGoals?.length > 0 && (
              <div className="absolute bottom-3 left-6 right-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-600">Daily Progress</span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold text-white" style={{ background: theme }}>
                    {Math.round((todayStats.dailyGoals.filter((g) => g.completed).length / todayStats.dailyGoals.length) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CALORIES NUTRITION + POPULAR + SCHEDULE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          <div className="bg-white p-6 rounded-2xl overflow-hidden shadow-md border border-gray-200">
            <h4 className="text-md font-medium mb-3">Calories & Nutrition</h4>
            <div className="w-full h-56"><Bar data={caloriesData} options={caloriesOptions} /></div>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-gray-200">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
            <div className="relative z-10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(227,0,42,0.15)" }}>
                  <span className="text-[#e3002a] text-lg">⚡</span>
                </div>
                <p className="text-gray-900 font-semibold text-[14px]">Popular Courses</p>
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 leading-snug">Fitness For Beginners</h2>
              <p className="mt-1 text-[13px] text-gray-700 leading-relaxed">
                1 Million+ people already joined this course. <span className="text-[#e3002a] font-semibold cursor-pointer">Learn More</span>
              </p>
              <div className="flex items-center gap-1 mt-3">
                <span className="text-[#e3002a] text-[16px]">★</span><span className="text-[#e3002a] text-[16px]">★</span><span className="text-[#e3002a] text-[16px]">★</span><span className="text-[#e3002a] text-[16px]">★</span><span className="text-gray-400 text-[16px]">★</span>
                <span className="text-[12px] text-gray-600 ml-1">(4.0)</span>
              </div>
              <div className="flex items-center mt-5">
                <img src="/trainer-1.jpg" className="w-9 h-9 rounded-full border-2 border-white -ml-3" alt="" />
                <img src="/trainer-1.jpg" className="w-9 h-9 rounded-full border-2 border-white -ml-3" alt="" />
                <img src="/trainer-1.jpg" className="w-9 h-9 rounded-full border-2 border-white -ml-3" alt="" />
                <img src="/trainer-1.jpg" className="w-9 h-9 rounded-full border-2 border-white -ml-3" alt="" />
                <span className="text-[11px] px-2 py-[2px] rounded-full bg-gray-100 text-gray-700 -ml-2">10k+</span>
              </div>
              <div className="flex justify-end -mt-18 -mr-6 -mb-4">
                <img src="/dumbbells.png" alt="equipment" className="w-34 h-auto object-contain" />
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-gray-900 font-semibold text-lg">Today's Schedule</h3>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#e3002a] text-white">
                {todaySchedule.length} {todaySchedule.length === 1 ? "Event" : "Events"}
              </span>
            </div>

            {scheduleLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : todaySchedule.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Calendar size={48} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium text-gray-500">No workouts scheduled</p>
                <p className="text-xs mt-1">Add from calendar</p>
              </div>
            ) : (
              <div className="space-y-4 -mt-5">
                {todaySchedule.map((event, idx) => (
                  <div key={idx} className="flex items-center gap-4 hover:bg-gray-50 -mx-3 px-3 py-3 rounded-xl transition-all duration-200">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${event.completed ? "bg-green-100" : "bg-[#e3002a]/10"}`}>
                      {event.title.toLowerCase().includes("yoga") && <StretchHorizontal size={22} className={event.completed ? "text-green-600" : "text-[#e3002a]"} />}
                      {event.title.toLowerCase().includes("cardio") && <Activity size={22} className={event.completed ? "text-green-600" : "text-[#e3002a]"} />}
                      {(event.title.toLowerCase().includes("strength") || event.title.toLowerCase().includes("gym") || event.title.toLowerCase().includes("lift")) && <Dumbbell size={22} className={event.completed ? "text-green-600" : "text-[#e3002a]"} />}
                      {event.source === "program" && <Target size={22} className={event.completed ? "text-green-600" : "text-blue-600"} />}
                      {event.source === "challenge" && <Zap size={22} className={event.completed ? "text-green-600" : "text-purple-600"} />}
                      {event.source === "class" && <Users size={22} className={event.completed ? "text-green-600" : "text-amber-600"} />}
                      {(!["yoga", "cardio", "strength", "gym", "lift"].some(k => event.title.toLowerCase().includes(k)) && !event.source) && <Calendar size={22} className={event.completed ? "text-green-600" : "text-[#e3002a]"} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-gray-900 truncate pr-6 ${event.completed ? "text-gray-400" : ""}`}>{event.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.time || "All Day"}</p>
                    </div>
                    {event.completed && <CheckCircle2 size={22} className="text-green-600 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: Active Session + Recent Activity (NOW LIVE FROM NOTIFICATIONS) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-6 mt-8">
          {/* Active Session Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-1/2 h-80 rounded-xl overflow-hidden shadow-lg bg-gray-50 relative">
                {latestSession?.thumbnail ? (
                  <img src={latestSession.thumbnail} alt={latestSession.workout} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="w-20 h-20 bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl mb-3"></div>
                    <p className="text-sm font-medium">No photo yet</p>
                    <p className="text-xs mt-1">Complete a workout to see it here</p>
                  </div>
                )}
              </div>

              <div className="w-full sm:w-1/2 flex flex-col justify-center">
                <h3 className="text-gray-900 font-semibold text-[16px] mb-1">Active Session Summary</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {sessionLoading ? "Loading latest workout..." : latestSession ? "Your most recent workout session" : "No workout completed yet"}
                </p>

                {sessionLoading ? (
                  <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-48" />)}</div>
                ) : latestSession ? (
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3"><Dumbbell size={20} className="text-[#e3002a]" /><div><span className="font-semibold text-gray-800">Workout:</span><p className="text-gray-700 font-medium">{latestSession.workout}</p></div></div>
                    <div className="flex items-center gap-3"><Flame size={20} className="text-[#e3002a]" /><div><span className="font-semibold text-gray-800">Calories:</span><p className="text-gray-700 font-medium">{latestSession.calories} kcal</p></div></div>
                    <div className="flex items-center gap-3"><Clock size={20} className="text-[#e3002a]" /><div><span className="font-semibold text-gray-800">Duration:</span><p className="text-gray-700 font-medium">{latestSession.duration} min</p></div></div>
                    {latestSession.avgHR && <div className="flex items-center gap-3"><HeartPulse size={20} className="text-[#e3002a]" /><div><span className="font-semibold text-gray-800">Avg HR:</span><p className="text-gray-700 font-medium">{latestSession.avgHR} bpm</p></div></div>}
                    <div className="flex items-center gap-3"><Calendar size={20} className="text-[#e3002a]" /><div><span className="font-semibold text-gray-800">Date:</span><p className="text-gray-700 font-medium">{latestSession.date}</p></div></div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell size={48} className="mx-auto text-gray-300 mb-3" />
                    <p>Complete a workout to see summary here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity - LIVE FROM NOTIFICATIONS API */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-gray-900 font-semibold text-[15px] mb-4">Recent Activity</h3>

            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mb-2" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Zap size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="font-medium">No recent activity</p>
                <p className="text-xs mt-1">Your notifications will appear here</p>
              </div>
            ) : (
              <div className="space-y-4 text-[14px]">
                {recentActivity.map((notif) => {
                  const IconComponent = getNotificationIcon(notif);
                  return (
                    <div key={notif._id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e3002a]/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent size={20} className="text-[#e3002a]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-semibold truncate pr-4">{notif.title}</p>
                        <span className="text-gray-500 text-xs">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {!notif.isRead && <div className="w-2 h-2 rounded-full bg-[#e3002a] mt-2 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}