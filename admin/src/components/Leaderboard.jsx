// AdminFitnessLeaderboard.jsx — WITH REAL API CALLS
import React, { useMemo, useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Flame,
  Dumbbell,
  Crown,
  TrendingUp,
  Award,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import axios from "axios"; 
import { useAdminAuth } from "../context/AdminAuthContext";
export default function AdminFitnessLeaderboard() {
  const THEME = "#e3002a";
  const { api } = useAdminAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [sortDir, setSortDir] = useState("asc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/leaderboard`); // ← Your backend endpoint
        const leaderboardData = response.data;

        // Ensure rank is correct (backend already ranks, but just in case)
        const rankedData = leaderboardData.map((user, index) => ({
          ...user,
          rank: user.rank || index + 1,
        }));

        setData(rankedData);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError("Failed to load leaderboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  function toggleSort(field) {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  }

  const filtered = useMemo(() => {
    let list = data.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.id?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return dir * (a.name || "").localeCompare(b.name || "");
      if (sortBy === "rank") return dir * (a.rank - b.rank);
      return dir * ((a[sortBy] || 0) - (b[sortBy] || 0));
    });
    return list;
  }, [data, query, sortBy, sortDir]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  function sparkline(arr = []) {
    return (arr || []).map((v, i) => ({ day: i + 1, val: v ? 1 : 0 }));
  }

  function exportCSV(rows = filtered) {
    const keys = ["rank", "id", "name", "challenges", "workouts", "calories", "hours", "lastWorkout"];
    const csv = [keys.join(",")].concat(
      rows.map((r) =>
        keys.map((k) => JSON.stringify(r[k] ?? "")).join(",")
      )
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leaderboard_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-white rounded-lg">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leaderboard</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time performance · Activity insights</p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => exportCSV()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 transition shadow-sm"
            >
              <Download size={16} />
              <span className="text-sm font-medium">Export CSV</span>
            </button>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border shadow-sm">
              <Search size={16} className="text-gray-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search members..."
                className="outline-none text-sm w-48 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* ANALYTICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.reduce((s, u) => s + (u.workouts || 0), 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp size={40} className="text-gray-300" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Total Challenges</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.reduce((s, u) => s + (u.challenges || 0), 0).toLocaleString()}
                </p>
              </div>
              <Award size={40} className="text-gray-300" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Inactive (last 7 days)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.filter((u) => (u.activity?.slice(-7) || []).reduce((s, x) => s + x, 0) === 0).length}
                </p>
              </div>
              <Trophy size={40} className="text-gray-300" />
            </div>
          </div>
        </div>

        {/* PODIUM */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Top Performers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {filtered.slice(0, 3).map((user) => (
            <div key={user.id} className="p-6 rounded-2xl bg-white shadow-sm border hover:shadow-lg transition">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3">
                  {user.rank === 1 ? <Crown size={48} className="text-yellow-500" /> :
                   user.rank === 2 ? <Medal size={48} className="text-gray-400" /> :
                   <Trophy size={48} className="text-[#e3002a]" />}
                </div>

                <img
                  src={user.avatar || `https://i.pravatar.cc/150?img=${user.id}`}
                  className="w-24 h-24 rounded-2xl border-4 shadow"
                  style={{ borderColor: THEME }}
                  alt={user.name}
                />

                <h3 className="text-lg font-bold text-gray-900 mt-3">{user.name || "Member"}</h3>
                <p className="text-sm text-gray-500">Rank #{user.rank}</p>

                <div className="flex gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Flame size={16} className="text-orange-500" /> {user.challenges || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell size={16} className="text-gray-700" /> {user.workouts || 0}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowModal(true);
                  }}
                  className="mt-4 px-4 py-2 text-sm rounded-xl border bg-gray-50 hover:bg-gray-100 transition"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* TABLE + PAGINATION + MODAL (same as before) */}
        {/* ... (table, pagination, modal code same as original) ... */}

        {/* TABLE */}
        <div className="bg-white shadow-sm border rounded-2xl p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Member</th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("challenges")}>
                    Challenges {sortBy === "challenges" && (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => toggleSort("workouts")}>
                    Workouts {sortBy === "workouts" && (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </th>
                  <th className="p-3">Activity</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 font-semibold text-[#e3002a]">{u.rank}</td>
                    <td className="p-3 flex items-center gap-3">
                      <img
                        src={u.avatar || `https://i.pravatar.cc/150?img=${u.id}`}
                        className="w-10 h-10 rounded border"
                        style={{ borderColor: THEME }}
                        alt={u.name}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{u.name || "Member"}</p>
                        <p className="text-xs text-gray-500">
                          ID: {u.id} • Last: {u.lastWorkout || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="p-3"><Flame size={14} /> {u.challenges || 0}</td>
                    <td className="p-3"><Dumbbell size={14} /> {u.workouts || 0}</td>
                    <td className="p-3 w-48">
                      <div style={{ width: 140, height: 36 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sparkline(u.activity)}>
                            <Line type="monotone" dataKey="val" stroke={THEME} strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowModal(true);
                        }}
                        className="px-3 py-1 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <p className="text-gray-500">
              Showing {(page - 1) * pageSize + 1} – {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded-lg bg-gray-50">Prev</button>
              <div className="px-3 py-1 border rounded-lg bg-white">{page}</div>
              <button onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / pageSize), p + 1))} className="px-3 py-1 border rounded-lg bg-gray-50">Next</button>
            </div>
          </div>
        </div>

        {/* MODAL (same as original) */}
        <AnimatePresence>
          {showModal && selectedUser && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div initial={{ y: 30, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }} className="bg-white w-full max-w-3xl p-6 rounded-2xl shadow-xl border">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <img src={selectedUser.avatar} className="w-20 h-20 rounded-2xl shadow" alt={selectedUser.name} />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                      <p className="text-sm text-gray-500">ID: {selectedUser.id} • Rank #{selectedUser.rank}</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowModal(false); setSelectedUser(null); }} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-xl border"><p className="text-xs text-gray-500">Workouts</p><p className="text-3xl font-bold text-gray-900">{selectedUser.workouts || 0}</p></div>
                  <div className="bg-gray-50 p-4 rounded-xl border"><p className="text-xs text-gray-500">Challenges</p><p className="text-3xl font-bold text-gray-900">{selectedUser.challenges || 0}</p></div>
                  <div className="bg-gray-50 p-4 rounded-xl border"><p className="text-xs text-gray-500">Calories</p><p className="text-3xl font-bold text-gray-900">{(selectedUser.calories || 0).toLocaleString()}</p></div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Activity — Last 14 Days</h4>
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparkline(selectedUser.activity)}>
                        <XAxis dataKey="day" hide />
                        <Tooltip />
                        <Line dataKey="val" stroke={THEME} strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
