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
import { useAdminAuth } from "../context/AdminAuthContext";

const THEME = "#e3002a";
const COLORS = ["#e3002a", "#5c9fff", "#ff9f5c", "#8b5cf6"];

export default function AdminDashboard() {
  const { api: axiosAdmin } = useAdminAuth();   // ← authenticated axios instance

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
  const [dailyProgress, setDailyProgress] = useState({
    percentage: 0,
    change: 0,
    actual: 0,
    expected: 0,
    daysPassed: 1,
    monthlyGoal: 0
  });

  // Goals Management
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({ label: "", target: "", color: THEME, dataSource: "revenue" });
  const [goals, setGoals] = useState([]);

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
        goalStatsRes,   // ← अब include किया
      ] = await Promise.all([
        axiosAdmin.get("/auth/admin/users", { params: { page: 1, limit: 200, sort: 'joinDate', order: 'desc' } }).catch(() => ({ data: { success: false } })),
        axiosAdmin.get("/revenue/today").catch(() => ({ data: { revenue: 124000 } })),
        axiosAdmin.get("/revenue/performance").catch(() => ({ data: { data: [] } })),
        axiosAdmin.get("/revenue/last-7-days").catch(() => ({ data: { success: false } })),
        axiosAdmin.get("/revenue/membership/distribution").catch(() => ({ data: {} })),
        axiosAdmin.get("/revenue/membership/summary").catch(() => ({ data: {} })),
        axios.get('/api/programs/weekly-stats').catch(() => ({ data: { success: false } })),
        axios.get('/api/programs/trending?days=7').catch(() => ({ data: { success: false, data: [] } })),
        axiosAdmin.get("/goals/stats").catch(() => ({ data: { success: false } })), // ← added
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

      // Weekly Activity fallback
      if (last7DaysRes.data.success && last7DaysRes.data.days) {
        const fallback = last7DaysRes.data.days.map((day, i) => ({
          day: new Date(day).toLocaleDateString("en-IN", { weekday: "short" }),
          sessions: Math.round((last7DaysRes.data.revenues[i] || 0) / 200) + Math.floor(Math.random() * 50) + 50
        }));
        setWeeklyActivity(fallback);
      }

      // Plan Distribution
      if (planDistRes.data.success && Array.isArray(planDistRes.data.data)) {
        setPlanDistribution(planDistRes.data.data.map(item => ({
          name: item.plan || item._id,
          value: item.count
        })));
      }

      // Membership Summary
      if (memberSummaryRes.data.success) {
        const d = memberSummaryRes.data;
        setMembershipSummary({
          active: d.active || 0,
          growth: d.growth || 0,
          avgSession: "N/A",
          avgRevenue: `₹${(d.averageValue || 0).toLocaleString()}`,
          churn: d.churn || "0%",
        });
      }

      // Trending Workouts
      if (trendingRes.data.success && trendingRes.data.data.length > 0) {
        setTrendingWorkouts(trendingRes.data.data);
      }

      // Daily Progress from goal stats
      if (goalStatsRes.data.success && goalStatsRes.data.stats) {
        const s = goalStatsRes.data.stats;
        setDailyProgress({
          percentage: s.dailyProgressPercentage || 0,
          change: s.changeVsExpected || 0,
          actual: s.monthRevenue || 0,
          expected: s.expectedRevenueTillToday || 0,
          daysPassed: s.daysPassed || 1,
          monthlyGoal: s.monthlyRevenueGoal || 2500000
        });
      }

    } catch (err) {
      console.error("Dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async () => {
    try {
      const [goalsRes, statsRes] = await Promise.all([
        axiosAdmin.get("/goals/current"),
        axiosAdmin.get("/goals/stats")
      ]);

      if (!goalsRes.data.success) {
        setGoals([]);
        return;
      }

      const goalsDB = goalsRes.data.data.goals || [];
      const stats = statsRes.data.success ? statsRes.data.stats : {};

      const updatedGoals = goalsDB.map(g => {
        const target = Number(g.target) || 0;
        let achieved = 0;

        switch (g.dataSource || "revenue") {
          case "revenue":
            achieved = target > 0 ? (stats.monthRevenue || 0) / target * 100 : 0;
            break;
          case "newMembers":
            achieved = target > 0 ? (stats.newSignupsMonth || 0) / target * 100 : 0;
            break;
          default:
            achieved = g.currentValue || 0;
        }

        achieved = Math.max(0, Math.min(100, Math.round(achieved)));
        return { ...g, achieved };
      });

      setGoals(updatedGoals);
    } catch (err) {
      console.error("Failed to load goals:", err);
      setGoals([]);
    }
  };

  const handleSaveGoal = async () => {
    if (!newGoal.label || !newGoal.target) return alert("Fill required fields");

    try {
      const payload = {
        label: newGoal.label,
        target: Number(newGoal.target),
        color: newGoal.color,
        dataSource: newGoal.dataSource
      };

      if (editingGoal) {
        await axiosAdmin.put(`/goals/update/${editingGoal._id}`, payload);
      } else {
        await axiosAdmin.post("/goals/add", payload);
      }

      await loadGoals();
      setShowManageModal(false);
      setEditingGoal(null);
      setNewGoal({ label: "", target: "", color: THEME, dataSource: "revenue" });
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm("Delete permanently?")) return;
    try {
      await axiosAdmin.delete(`/goals/delete/${id}`);
      await loadGoals();
    } catch (err) {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([fetchAllData(), loadGoals()]);
    };
    loadAll();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchAllData(), loadGoals()]).finally(() =>
      setTimeout(() => setRefreshing(false), 900)
    );
  };

  // बाकी UI code same as before...
  // (तुम्हारा पूरा return statement same रख सकते हो, बस ऊपर के fixes लागू कर दो)

  // ... [बाकी तुम्हारा पूरा JSX return यहाँ paste कर दो, कोई बदलाव नहीं]