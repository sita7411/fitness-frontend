import { motion } from "framer-motion";
import CountUp from "react-countup";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart, Line, AreaChart, Area, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, UserPlus, IndianRupee, Flame, Activity,
  TrendingUp, Target, Award, Plus, RefreshCw,
} from "lucide-react";

const THEME = "#e3002a";
const COLORS = ["#e3002a", "#5c9fff", "#ff9f5c", "#8b5cf6"];

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Live Data
  const [totalMembers, setTotalMembers] = useState(18240);
  const [newSignupsToday, setNewSignupsToday] = useState(142);
  const [recentMembers, setRecentMembers] = useState([]);
  const [todayRevenue, setTodayRevenue] = useState(124000);
  const [revenueData, setRevenueData] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [planDistribution, setPlanDistribution] = useState([]);
  const [trendingWorkouts, setTrendingWorkouts] = useState([]);
  const [membershipSummary, setMembershipSummary] = useState({
    active: 0, growth: 0, avgSession: "0m", avgRevenue: "₹0", churn: "0%",
  });
  // Add this state (just below other useState)
  const [dailyProgress, setDailyProgress] = useState({
    percentage: 0,     // fallback
    change: 0,          // fallback
    actual: 0,      // fallback
    expected:0,   // fallback
    daysPassed: 1,
    monthlyGoal: 0
  });
  // Goals Management - Full Power
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ label: "", target: "", color: THEME, dataSource: "revenue" });
  const [goals, setGoals] = useState([]); // DB se load hoga

  // Static Data
  const topTrainers = [
    { name: "Rohit Sharma", rating: 4.9, clients: 48 },
    { name: "Sana Patel", rating: 4.8, clients: 36 },
    { name: "Amit Joshi", rating: 4.7, clients: 29 },
  ];

  const liveActivity = [
    "Priya finished HIIT Pro",
    "Arjun started Power Yoga",
    "Neha hit 15k steps!",
    "Rahul upgraded to Pro",
  ];

  // Fetch All Dashboard Data
  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [
        membersRes,
        todayRevRes,
        performanceRes,
        last7DaysRes,
        planDistRes,
        memberSummaryRes,
        weeklyWorkoutsRes,
        trendingRes,

      ] = await Promise.all([
        axios.get('/api/auth/admin/users', { params: { page: 1, limit: 200, sort: 'joinDate', order: 'desc' }, withCredentials: true }).catch(() => ({ data: { success: false } })),
        axios.get('/api/admin/revenue/today', { withCredentials: true }).catch(() => ({ data: { revenue: 124000 } })),
        axios.get('/api/admin/revenue/performance', { withCredentials: true }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/admin/revenue/last-7-days', { withCredentials: true }).catch(() => ({ data: { success: false } })),
        axios.get('/api/revenue/membership/distribution', { withCredentials: true }).catch(() => ({ data: {} })),
        axios.get('/api/revenue/membership/summary', { withCredentials: true }).catch(() => ({ data: {} })),
        axios.get('/api/programs/weekly-stats', { withCredentials: true }).catch(() => ({ data: { success: false } })),
        axios.get('/api/programs/trending?days=7', { withCredentials: true }).catch(() => ({ data: { success: false, data: [] } })),
      ]);

      // Members + Signups
      if (membersRes.data.success) {
        const users = membersRes.data.users || [];
        const total = membersRes.data.total || users.length;
        setTotalMembers(total);
        setRecentMembers(users.slice(0, 5));
        const today = new Date().toISOString().split('T')[0];
        const todayCount = users.filter(u => (u.joinDate || u.createdAt || "").startsWith(today)).length;
        setNewSignupsToday(todayCount);
      }

      setTodayRevenue(todayRevRes.data.revenue || 0);

      if (performanceRes.data.data?.length > 0) {
        const formatted = performanceRes.data.data.map(item => ({
          day: new Date(item.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          value: item.revenue
        }));
        setRevenueData(formatted);
      }

      // Weekly Activity
      if (weeklyWorkoutsRes.data.success && weeklyWorkoutsRes.data.weeklyWorkouts?.length > 0) {
        setWeeklyActivity(weeklyWorkoutsRes.data.weeklyWorkouts);
      } else if (last7DaysRes.data.success && last7DaysRes.data.days) {
        const fallback = last7DaysRes.data.days.map((day, i) => {
          const revenue = last7DaysRes.data.revenues[i] || 0;
          const sessions = revenue > 0
            ? Math.round(revenue / 200) + Math.floor(Math.random() * 20)
            : 45 + Math.round(Math.random() * 55);
          return { day, sessions: Math.max(0, sessions) };
        });
        setWeeklyActivity(fallback);
      } else {
        setWeeklyActivity([
          { day: "Mon", sessions: 98 }, { day: "Tue", sessions: 112 },
          { day: "Wed", sessions: 105 }, { day: "Thu", sessions: 89 },
          { day: "Fri", sessions: 134 }, { day: "Sat", sessions: 76 },
          { day: "Sun", sessions: 62 },
        ]);
      }

      // Plan Distribution
      if (planDistRes.data.success && Array.isArray(planDistRes.data.data)) {
        setPlanDistribution(planDistRes.data.data.map(item => ({
          name: item.plan || item._id,
          value: item.count
        })));
      }

      // Membership Summary
      if (memberSummaryRes.data.success !== undefined) {
        const d = memberSummaryRes.data;
        setMembershipSummary({
          active: d.active || 0,
          growth: 0,
          avgSession: "N/A",
          avgRevenue: `₹${(d.averageValue || 0).toLocaleString()}`,
          churn: "0%",
        });
      }

      // Trending Workouts
      if (trendingRes.data.success && trendingRes.data.data.length > 0) {
        setTrendingWorkouts(trendingRes.data.data);
      } else {
        setTrendingWorkouts([
          { workoutId: "1", name: "HIIT Pro 30", users: 1842, trend: "+42%" },
          { workoutId: "2", name: "Power Yoga Flow", users: 1456, trend: "+31%" },
          { workoutId: "3", name: "Full Body Strength", users: 1203, trend: "+28%" },
        ]);
      }

      if (goalStatsRes.data.success) {
        const s = goalStatsRes.data.stats;
        setDailyProgress({
          percentage: s.dailyProgressPercentage || 0,
          change: s.changeVsExpected || 0,
          actual: s.monthRevenue || 0,
          expected: s.expectedRevenueTillToday || 0,
          daysPassed: s.daysPassed || 1,
          monthlyGoal: s.monthlyRevenueGoal || 2500000
        });
      } else {
        // Fallback agar API fail ho
        setDailyProgress(prev => ({ ...prev, percentage: 0, change: 0 }));
      }

    } catch (err) {
      console.error("Dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load Goals
  const loadGoals = async () => {
    try {
      const [goalsRes, statsRes] = await Promise.all([
        axios.get("/api/goals/current", { withCredentials: true }),
        axios.get("/api/goals/stats", { withCredentials: true })
      ]);

      if (!goalsRes.data.success || !statsRes.data.success) {
        setGoals([]);
        return;
      }

      const goalsDB = goalsRes.data.data.goals;
      const stats = statsRes.data.stats;

      const updatedGoals = goalsDB.map(g => {
        const target = Number(g.target) || 0;
        const source = g.dataSource || "revenue";
        let achieved = 0;

        switch (source) {
          case "revenue":
            achieved = target > 0 ? (stats.monthRevenue / target) * 100 : 0;
            break;
          case "newMembers":
            achieved = target > 0 ? (stats.newSignupsMonth / target) * 100 : 0;
            break;
          case "retention":
            achieved = stats.retentionRate || 0;
            break;
          case "activeMembers":
            achieved = target > 0 ? (stats.activeMembers / target) * 100 : 0;
            break;
          case "instagram":
          case "youtube":
          case "referrals":
          case "manual":
          default:
            achieved = g.currentValue || 0; // future mein admin khud update karega
            break;
        }

        achieved = Math.max(0, Math.min(100, Math.round(achieved)));

        return { ...g, achieved };
      });

      setGoals(updatedGoals);
      if (statsRes.data.success) {
        setDailyProgress({
          percentage: stats.dailyProgressPercentage || 0,
          change: stats.changeVsExpected || 0,
          actual: stats.monthRevenue || 0,
          expected: stats.expectedRevenueTillToday || 0,
          daysPassed: stats.daysPassed || 1,
          monthlyGoal: stats.monthlyRevenueGoal || 0
        });
      }
    } catch (err) {
      console.error("Failed to load goals:", err);
      setGoals([]);
    }
  };
  // Save / Update Goal
  const handleSaveGoal = async () => {
    if (!newGoal.label || !newGoal.target) {
      alert("Goal name and target required");
      return;
    }

    try {
      const goalData = {
        label: newGoal.label,
        target: newGoal.target,
        color: newGoal.color,
        dataSource: newGoal.dataSource || "revenue"   // ← YE ADD KAR DE
      };
      if (editingGoal) {
        await axios.put(`/api/goals/update/${editingGoal._id}`, newGoal, { withCredentials: true });
      } else {
        await axios.post("/api/goals/add", newGoal, { withCredentials: true });
      }
      loadGoals();
      setShowManageModal(false);
      setNewGoal({
        label: g.label,
        target: g.target,
        color: g.color || THEME,
        dataSource: g.dataSource || "revenue"   // ← Perfect hai
      });
      setEditingGoal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save goal");
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm("Delete this goal permanently?")) return;
    try {
      await axios.delete(`/api/goals/delete/${id}`, { withCredentials: true });
      loadGoals();
    } catch (err) {
      alert("Delete failed");
    }
  };
  useEffect(() => {
    const loadAll = async () => {
      await fetchAllData();
      await loadGoals();
    };
    loadAll();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData().finally(() => setTimeout(() => setRefreshing(false), 900));
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  };

  const formatDate = (iso) => !iso ? "N/A" : new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const stats = [
    { label: "Total Members", value: totalMembers, icon: Users, color: "#8b5cf6" },
    { label: "Today's Revenue", value: todayRevenue, prefix: "₹", icon: IndianRupee, color: THEME },
    { label: "Workouts Today", value: weeklyActivity.find(d => d.day === new Date().toLocaleDateString("en-US", { weekday: "short" }))?.sessions || 0, icon: Flame, color: "#ffa45c" },
    { label: "New Signups", value: newSignupsToday, icon: UserPlus, color: "#10b981" },
  ];

  return (
    <div className="min-h-screen bg-white rounded-lg p-6">

      {/* Floating Refresh */}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRefresh}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white"
        style={{ background: THEME }}>
        {refreshing ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={26} />}
      </motion.button>

      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{greeting()}, Admin</h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            Your Fitness Admin Dashboard • {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="w-10 h-10 bg-[#e3002a] text-white rounded-full shadow flex items-center justify-center hover:bg-red-700 transition"><UserPlus size={18} /></button>
          <button className="w-10 h-10 bg-[#e3002a] text-white rounded-full shadow flex items-center justify-center hover:bg-red-700 transition"><Flame size={18} /></button>
          <button className="w-10 h-10 bg-[#e3002a] text-white rounded-full shadow flex items-center justify-center hover:bg-red-700 transition"><TrendingUp size={18} /></button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">{s.label}</p>
                <p className="mt-2 text-2xl font-bold">
                  {s.prefix && <span>{s.prefix}</span>}
                  <CountUp end={s.value} duration={1.8} separator="," />
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: `${s.color}20` }}>
                <s.icon size={26} color={s.color} />
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-3">Updated a few seconds ago</div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Revenue Performance */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold">Revenue Performance</h2>
                <p className="text-sm text-gray-500">Monthly overview</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">This month</div>
                <div className="text-xl font-semibold">
                  {(() => {
                    const total = revenueData.reduce((a, b) => a + (b.value || 0), 0);
                    return total >= 100000 ? `₹${(total / 100000).toFixed(1)}L` : `₹${total.toLocaleString()}`;
                  })()}
                </div>
              </div>
            </div>
            <ResponsiveContainer height={260}>
              <LineChart data={revenueData.length > 0 ? revenueData : [{ day: "Jan", value: 80000 }]}>
                <CartesianGrid stroke="#eaeaea" strokeDasharray="4 4" />
                <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#ddd" }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#ddd" }} />
                <Tooltip contentStyle={{ background: "white", borderRadius: 12, border: "1px solid #f3f3f3", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} />
                <Line type="monotone" dataKey="value" stroke="#e3002a" strokeWidth={3} dot={{ r: 4, fill: "#fff", stroke: "#e3002a", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#e3002a" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Activity + Trending */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/80 rounded-2xl p-6 shadow">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Activity size={18} color={THEME} /> Weekly Activity</h3>
              <ResponsiveContainer height={180}>
                <AreaChart data={weeklyActivity.length > 0 ? weeklyActivity : [{ day: "Mon", sessions: 1240 }]}>
                  <defs>
                    <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={THEME} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={THEME} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fill: "#888" }} />
                  <YAxis tick={{ fill: "#888" }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sessions" stroke={THEME} fill="url(#areaGrad2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/80 rounded-2xl p-6 shadow">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingUp size={18} color={THEME} /> Trending Workouts
              </h3>
              <div className="space-y-3">
                {trendingWorkouts.length > 0 ? (
                  trendingWorkouts.map((w, i) => (
                    <motion.div key={w.workoutId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ x: 8 }}
                      className="flex items-center justify-between bg-gray-50/50 rounded-xl p-3 -mx-2 hover:bg-red-50/70 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg" style={{ background: THEME }}>
                          {i + 1}
                        </div>
                        <div className="ml-3">
                          <div className="max-w-[120px]">
                            <p className="font-semibold text-gray-800 truncate">{w.name}</p>
                          </div>
                          <p className="text-xs text-gray-500">{w.users} active users</p>
                        </div>
                      </div>
                      <span className="text-green-600 font-bold">{w.trend}</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-8">No activity yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Daily Progress + Membership Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DAILY PROGRESS - MONTHLY GOAL KE HISAAB SE (Same Size Card) */}
            <div className="bg-white/80 rounded-2xl p-5 shadow flex flex-col items-center">
              <h4 className="text-sm font-semibold whitespace-nowrap text-gray-600 mb-3">Monthly Goal Progress</h4>

              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                  {/* Background Circle */}
                  <path
                    className="text-gray-200"
                    strokeWidth="3.8"
                    fill="none"
                    stroke="#e5e7eb"
                    d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831 15.9155 15.9155 0 1 1 0-31.831"
                  />
                  {/* Progress Circle */}
                  <path
                    strokeWidth="3.8"
                    stroke={THEME}
                    fill="none"
                    strokeLinecap="round"
                    d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831 15.9155 15.9155 0 1 1 0-31.831"
                    strokeDasharray={`${Math.min(dailyProgress.percentage, 100)} 100`}
                  />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">
                      {dailyProgress.percentage}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Day {dailyProgress.daysPassed || 1}
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Info */}
              <div className="mt-3 text-center w-full">
                <div className="text-lg font-bold text-gray-800">
                  ₹{dailyProgress.actual.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-gray-500">
                  Expected: ₹{dailyProgress.expected.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Change Indicator */}
              <div className="mt-3 flex whitespace-nowrap items-center gap-2">
                <span className={`text-sm font-bold ${dailyProgress.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {dailyProgress.change >= 0 ? "Up" : "Down"} {Math.abs(dailyProgress.change)}%
                </span>
                <span className="text-xs text-gray-500">vs expected pace</span>
              </div>
            </div>
            
            <div className="bg-white shadow-lg rounded-2xl p-5 col-span-2">
              <h4 className="text-sm font-semibold text-gray-600 mb-4">Membership Summary</h4>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{membershipSummary.active.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Active Members</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold text-green-500 flex items-center gap-1">+{membershipSummary.growth}%</div>
                  <div className="text-sm text-gray-500 mt-1">This month</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Avg. Session", value: membershipSummary.avgSession },
                  { label: "Avg. Revenue", value: membershipSummary.avgRevenue },
                  { label: "Churn", value: membershipSummary.churn },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-500">{s.label}</div>
                    <div className="font-semibold text-gray-900 mt-1">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Members Table */}
          <div className="bg-white/80 rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Recent Members</h3>
              <div className="text-sm text-gray-500">
                {loading ? "Loading..." : `${recentMembers.length} latest members`}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-500 border-b">
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Plan</th>
                    <th className="py-3 px-2">Joined</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading members...</td></tr>
                  ) : recentMembers.map((m, i) => (
                    <tr key={m._id || i} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm">{i + 1}</td>
                      <td className="py-3 px-2 font-medium">{m.name || "Unknown"}</td>
                      <td className="py-3 px-2 text-sm text-gray-600">{m.plan || "N/A"}</td>
                      <td className="py-3 px-2 text-sm text-gray-600">{formatDate(m.joinDate || m.createdAt)}</td>
                      <td className="py-3 px-2">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${(m.membership || "").toLowerCase() === "active" ? "bg-green-100 text-green-700" :
                          (m.membership || "").toLowerCase() === "trial" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                          {m.membership || "Active"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <button className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg">Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* GOALS - SAME UI, FULL POWER */}
          <div className="bg-white/80 rounded-2xl p-5 shadow">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm text-gray-600 flex items-center gap-2">
                <Target size={16} color={THEME} /> Goals ({goals.length})
              </h4>
              <button
                onClick={() => setShowManageModal(true)}
                className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
              >
                <Plus size={15} />
                Manage Goals
              </button>
            </div>

            <div className="space-y-4">
              {goals.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm">No goals set yet</p>
              ) : (
                goals.map((g, i) => (
                  <div key={g._id || i}>
                    <div className="flex justify-between text-gray-700 text-sm mb-1">
                      <span>{g.label}</span>
                      <span className="font-bold">{g.achieved || 0}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${g.achieved || 0}%` }}
                        transition={{ duration: 1.2, delay: i * 0.15 }}
                        className="h-2.5 rounded-full"
                        style={{ background: g.color || THEME }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Targets for {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </div>
          </div>

          {/* Top Performer */}
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl p-5 relative overflow-hidden shadow text-white" style={{ background: `linear-gradient(135deg, ${THEME} 0%, #c70123 100%)` }}>
            <Award className="absolute top-4 right-4 opacity-20" size={36} />
            <div className="relative z-10">
              <p className="text-sm opacity-90">Performer of the Month</p>
              <h3 className="text-xl font-bold mt-1">Rohit Sharma</h3>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div>92% Rating</div>
                <div>48 Active Clients</div>
              </div>
            </div>
          </motion.div>

          {/* Plan Distribution */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-4">Plan Distribution</h4>
            {(!planDistribution || planDistribution.length === 0) && (
              <div className="text-center text-gray-400 text-sm mb-4">Loading plans...</div>
            )}
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={planDistribution.length > 0 ? planDistribution : [{ name: "Basic", value: 2 }, { name: "Premium", value: 1 }]}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} cornerRadius={8}
                >
                  {(planDistribution.length > 0 ? planDistribution : [{ name: "Basic" }, { name: "Premium" }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} members`} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "13px", paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Trainers */}
          <div className="bg-white/80 rounded-2xl p-5 shadow">
            <h4 className="text-sm text-gray-600 mb-3">Top Trainers</h4>
            <div className="space-y-3">
              {topTrainers.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-700">
                      {t.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-sm text-gray-500">{t.clients} clients</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{t.rating} stars</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
              <Activity size={18} color={THEME} /> Live Activity
            </h4>
            <div className="flex flex-col divide-y divide-gray-200">
              {liveActivity.map((a, i) => (
                <div key={i} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-md">
                  <span className="text-gray-700 text-sm">{a}</span>
                  <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                    {i === 0 ? "now" : `${i * 2}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MANAGE GOALS MODAL - Ek Button Se Sab Kuch */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 text-center">
              <h2 className="text-2xl font-bold">Manage Goals</h2>
            </div>

            {/* Add/Edit Form */}
            <div className="p-6 border-b">
              <h3 className="font-semibold mb-4">{editingGoal ? "Edit Goal" : "Add New Goal"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <input
                  type="text"
                  placeholder="Goal Name (e.g. Instagram Followers)"
                  value={newGoal.label}
                  onChange={(e) => setNewGoal({ ...newGoal, label: e.target.value })}
                  className="px-4 py-3 border rounded-xl focus:ring-4 focus:ring-red-100"
                />
                <input
                  type="number"
                  placeholder="Target (e.g. 50000)"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  className="px-4 py-3 border rounded-xl focus:ring-4 focus:ring-red-100"
                />
                <select
                  value={newGoal.dataSource || "revenue"}
                  onChange={(e) => setNewGoal({ ...newGoal, dataSource: e.target.value })}
                  className="px-4 py-3 border rounded-xl bg-white"
                >
                  <option value="revenue">Monthly Revenue</option>
                  <option value="newMembers">New Members</option>
                  <option value="retention">Retention Rate (%)</option>
                  <option value="activeMembers">Active Members</option>
                </select>
                <select
                  value={newGoal.color}
                  onChange={(e) => setNewGoal({ ...newGoal, color: e.target.value })}
                  className="px-4 py-3 border rounded-xl bg-white"
                >
                  <option value={THEME}>Red</option>
                  <option value="#5c9fff">Blue</option>
                  <option value="#10b981">Green</option>
                  <option value="#f59e0b">Yellow</option>
                  <option value="#8b5cf6">Purple</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setNewGoal({ label: "", target: "", color: THEME });
                    setEditingGoal(null);
                  }}
                  className="px-4 py-2 border rounded-xl"
                >
                  Clear
                </button>
                <button
                  onClick={handleSaveGoal}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
                >
                  {editingGoal ? "Update" : "Add"} Goal
                </button>
              </div>
            </div>

            {/* Current Goals List */}
            <div className="p-6">
              <h3 className="font-semibold mb-4">Current Goals</h3>
              {goals.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No goals created yet</p>
              ) : (
                <div className="space-y-3">
                  {goals.map((g, index) => (
                    <div key={g._id || `goal-${index}`} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">                      <div>
                      <div className="font-medium">{g.label}</div>
                      <div className="text-sm text-gray-600">Target: {Number(g.target).toLocaleString()}</div>
                    </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium">
                          {g.achieved || 0}%
                        </span>
                        <button
                          onClick={() => {
                            setNewGoal({
                              label: g.label,
                              target: g.target,
                              color: g.color || THEME,
                              dataSource: g.dataSource || "revenue"   // ← YE ADD KAR DO
                            });
                            setEditingGoal(g);
                          }}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(g._id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => setShowManageModal(false)}
                className="w-full py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}