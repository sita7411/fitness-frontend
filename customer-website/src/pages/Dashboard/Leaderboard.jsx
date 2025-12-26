// MemberLeaderboard.jsx — LIVE WITH API
import React, { useMemo, useState, useEffect } from "react";
import {
    Crown,
    Medal,
    Trophy,
    Search,
    Dumbbell,
    Flame,
    TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

export default function MemberLeaderboard({ currentUserId }) {
    const THEME = "#e3002a";

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [q, setQ] = useState("");

    // Fetch leaderboard data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.get("http://localhost:5000/api/leaderboard?t=" + Date.now(), {
                    withCredentials: true,
                });
                const leaderboard = res.data;

                const ranked = leaderboard.map((user, i) => ({
                    ...user,
                    id: user._id || user.id,
                    rank: user.rank || i + 1,
                }));

                setData(ranked);

                // ← YE TEEN LINES YAHAN DAALO (setData ke immediately baad)
                console.log("Full leaderboard data from backend:", ranked);
                console.log("currentUserId from props:", currentUserId, typeof currentUserId);
                console.log("All user IDs:", ranked.map(u => ({ name: u.name, id: u.id, _id: u._id, type: typeof u.id })));
                // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
            } catch (err) {
                console.error("Leaderboard fetch error:", err);
                setError("Failed to load leaderboard. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filtered = useMemo(() => {
        let list = data;

        if (q.trim()) {
            const query = q.toLowerCase();
            list = list.filter((u) =>
                u.name?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query) // bonus: email se bhi search
            );
        }

        // Client-side sort by workouts → challenges (same as backend)
        const sorted = [...list].sort((a, b) => {
            if (b.workouts !== a.workouts) return b.workouts - a.workouts;
            if (b.challenges !== a.challenges) return b.challenges - a.challenges;
            return b.calories - a.calories;
        });
        return sorted.map((user, index) => ({
            ...user,
            rank: index + 1,
        }));
    }, [data, q]);

    const top1 = filtered[0] || {
        name: "No data yet",
        workouts: 0,
        challenges: 0,
        calories: 0,
        avatar: "https://i.pravatar.cc/150?img=0",
    };
    const current = filtered.find(
        (u) => String(u.id) === String(currentUserId)
    ) || {
        id: currentUserId,
        name: "You",
        workouts: 0,
        challenges: 0,
        calories: 0,
        avatar: `https://i.pravatar.cc/150?u=${currentUserId}`,
        rank: filtered.length > 0 ? filtered.length + 1 : 1,
    };
    const improvement = {
        workouts: Math.max(0, (top1.workouts || 0) - (current.workouts || 0)),
        challenges: Math.max(0, (top1.challenges || 0) - (current.challenges || 0)),
        calories: Math.max(0, (top1.calories || 0) - (current.calories || 0)),
    };


    const scrollToMyRow = () => {
        if (!currentUserId) return;

        const el = document.getElementById(String(currentUserId));
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("animate-pulse");
            setTimeout(() => el.classList.remove("animate-pulse"), 2000);
        }
    };


    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen p-6 bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen p-6 bg-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <p className="text-red-600 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-white rounded-lg">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Member Leaderboard</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Compare members — see top performers and your position.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center bg-white px-3 py-2 rounded-xl border shadow-sm w-full md:w-64">
                            <Search size={16} className="text-gray-400" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search members..."
                                className="ml-2 outline-none text-sm w-full bg-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Top Performers Podium */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-2xl border shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Top Performers</h2>
                                <p className="text-sm text-gray-500">Based on workouts completed</p>
                            </div>
                            <Trophy className="text-red-500" />
                        </div>

                        <div className="flex items-end justify-center gap-4">
                            {[filtered[1], filtered[0], filtered[2]]
                                .filter(Boolean)
                                .map((u) => {
                                    const isFirst = u.rank === 1;
                                    const isSecond = u.rank === 2;

                                    return (
                                        <motion.div
                                            key={u.id}
                                            whileHover={{ y: -6, scale: 1.03 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                            className={`relative w-full max-w-[220px] rounded-2xl border p-4 text-center shadow-sm
                                                ${isFirst
                                                    ? "bg-gradient-to-b from-yellow-50 to-white h-[360px]"
                                                    : isSecond
                                                        ? "bg-gradient-to-b from-gray-50 to-white h-[320px]"
                                                        : "bg-gradient-to-b from-red-50 to-white h-[300px]"
                                                }`}
                                        >
                                            {/* Rank Badge */}
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow
                                                        ${isFirst
                                                            ? "bg-yellow-500"
                                                            : isSecond
                                                                ? "bg-gray-400"
                                                                : "bg-red-500"
                                                        }`}
                                                >
                                                    {u.rank}
                                                </div>
                                            </div>

                                            {/* Crown */}
                                            {isFirst && (
                                                <Crown
                                                    size={36}
                                                    className="absolute -top-14 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow"
                                                />
                                            )}

                                            {/* Avatar */}
                                            <img
                                                src={u.avatar || `https://i.pravatar.cc/150?u=${u.id}`}
                                                alt={u.name}
                                                className="w-20 h-20 rounded-full mx-auto mt-8 border-2 shadow"
                                                style={{ borderColor: THEME }}
                                            />

                                            {/* Name */}
                                            <h4 className="mt-3 font-semibold text-gray-800 truncate">
                                                {u.name || "Member"}
                                            </h4>
                                            <p className="text-xs text-gray-500">Rank #{u.rank}</p>

                                            {/* Stats */}
                                            <div className="mt-4 flex justify-center gap-4 text-sm text-gray-700">
                                                <div className="flex items-center gap-1">
                                                    <Dumbbell size={14} /> {u.workouts || 0}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Flame size={14} /> {u.challenges || 0}
                                                </div>
                                            </div>

                                            {/* Calories */}
                                            <div className="mt-3 text-xs text-gray-500">
                                                {(u.calories || 0).toLocaleString()} kcal burned
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    </div>


                    {/* You vs Top Performer Card */}
                    <div className="bg-white p-6 rounded-2xl border shadow-sm relative">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-xs text-gray-500">Performance Comparison</p>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    You vs {top1.name || "Top Performer"}
                                </h3>
                            </div>
                            <TrendingUp size={28} className="text-red-500 opacity-70" />
                        </div>

                        {/* Avatars */}
                        <div className="flex items-center justify-center gap-6 mb-6">
                            <div className="text-center">
                                <img
                                    src={current.avatar || `https://i.pravatar.cc/150?u=${currentUserId}`}
                                    className="w-14 h-14 rounded-full border-2 mx-auto"
                                    style={{ borderColor: THEME }}
                                    alt="You"
                                />
                                <p className="text-xs mt-1 font-medium text-gray-700">You</p>
                            </div>

                            <span className="text-ls -mt-4 ml-1 text-gray-400 font-semibold">VS</span>

                            <div className="text-center">
                                <img
                                    src={top1.avatar || `https://i.pravatar.cc/150?u=top`}
                                    className="w-14 h-14 rounded-full border-2 mx-auto"
                                    style={{ borderColor: THEME }}
                                    alt={top1.name}
                                />
                                <p className="text-xs mt-1 font-medium text-gray-700 truncate max-w-[80px]">
                                    {top1.name || "Top"}
                                </p>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="space-y-4">
                            {[
                                { label: "Workouts", value: current.workouts || 0, max: Math.max(top1.workouts || 0, 1) },
                                { label: "Challenges", value: current.challenges || 0, max: Math.max(top1.challenges || 0, 1) },
                                { label: "Calories", value: current.calories || 0, max: Math.max(top1.calories || 0, 1) },
                            ].map((m) => (
                                <div key={m.label}>
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>{m.label}</span>
                                        <span>{m.value} / {m.max}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full">
                                        <div
                                            className="h-1.5 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min(100, (m.value / m.max) * 100)}%`,
                                                backgroundColor: THEME,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Gap Summary */}
                        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                            {[
                                { label: "Workouts", value: improvement.workouts },
                                { label: "Challenges", value: improvement.challenges },
                                { label: "Calories", value: improvement.calories.toLocaleString() },
                            ].map((i) => (
                                <div key={i.label} className="border rounded-xl p-3 bg-gray-50">
                                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                                        gap
                                    </p>
                                    <p className="text-base font-semibold text-gray-800 mt-1">
                                        {i.value}
                                    </p>
                                    <p className="text-[10px] text-gray-400">{i.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Action */}
                        <button
                            onClick={scrollToMyRow}
                            className="w-full mt-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
                        >
                            Highlight My Position
                        </button>
                    </div>

                </div>

                {/* Full Leaderboard Table */}
                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-md font-semibold text-gray-800">Leaderboard</h3>
                        <p className="text-xs text-gray-500">Showing {filtered.length} members</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead>
                                <tr className="text-sm font-medium text-gray-500 border-b">
                                    <th className="px-3 py-2">#</th>
                                    <th className="px-3 py-2">Member</th>
                                    <th className="px-3 py-2">Workouts</th>
                                    <th className="px-3 py-2">Challenges</th>
                                    <th className="px-3 py-2">Calories</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {filtered.map((u) => {
                                    const isCurrent = String(u.id) === String(currentUserId);
                                    return (
                                        <tr
                                            id={u.id}
                                            key={u.id}
                                            className={`border-b transition-all ${isCurrent
                                                ? "bg-red-50 border-l-4 border-red-500 font-medium"
                                                : "hover:bg-gray-50"
                                                }`}
                                        >
                                            <td className="px-3 py-3 w-12">{u.rank}</td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={u.avatar || `https://i.pravatar.cc/150?img=${u.id}`}
                                                        alt={u.name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-800">{u.name || "Member"}</div>
                                                        <div className="text-xs text-gray-500">Rank #{u.rank}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">{u.workouts || 0}</td>
                                            <td className="px-3 py-3">{u.challenges || 0}</td>
                                            <td className="px-3 py-3">{(u.calories || 0).toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}