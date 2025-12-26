// src/pages/DashboardChallenges.jsx → FULL FINAL VERSION (Identical to MyWorkoutsProPremium)

import React, { useState, useEffect, useRef } from 'react';
import {
    Play,
    Pause,
    Clock,
    Zap,
    CheckCircle,
    Calendar,
    Trophy,
    BarChart2,
    X,
    Bell,
    Repeat,
    RefreshCw,
    Flame,
    Target
} from 'lucide-react';
import { Progress } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const THEME = '#e3002a';

function IconButton({ children, className = '', ...props }) {
    return (
        <button {...props} className={`p-2 rounded-lg hover:bg-gray-100 transition ${className}`}>
            {children}
        </button>
    );
}

function ChallengeCard({ challenge, active, onClick }) {
    return (
        <motion.div
            layout
            onClick={onClick}
            initial={{ opacity: 0.8, y: 10 }}
            animate={{
                opacity: active ? 1 : 0.95,
                scale: active ? 1.03 : 1,
                y: 0
            }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className={`w-full rounded-2xl cursor-pointer bg-white shadow-md overflow-hidden transition-all ${active ? 'ring-2 ring-red-600 shadow-[0_0_25px_rgba(227,0,42,0.3)]' : ''}`}
        >
            <div className="relative h-48 w-full overflow-hidden rounded-2xl">
                <img
                    src={challenge.thumbnail || '/challenge-default.jpg'}
                    alt={challenge.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                <div className="absolute left-4 bottom-4 text-white">
                    <div className="text-xs tracking-wide opacity-90">
                        Challenge • {challenge.totalDays} days
                    </div>
                    <div className="text-xl font-semibold leading-snug drop-shadow-md">
                        {challenge.title}
                    </div>
                </div>
            </div>
            <div className="p-4 bg-white">
                <div className="text-sm text-gray-500">
                    {challenge.difficulty || 'Intermediate'} • {challenge.totalCalories || '2800'} kcal
                </div>
                <div className="mt-4 flex gap-3 text-xs">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        <Clock size={14} />
                        {challenge.totalDays} days
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        <Flame size={14} color={THEME} />
                        {challenge.totalCalories || '2800'} kcal
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function DashboardChallenges() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChallengeId, setSelectedChallengeId] = useState(null);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [running, setRunning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(30);
    const [completedExercises, setCompletedExercises] = useState([]);
    const [filter, setFilter] = useState('All');
    const [query, setQuery] = useState('');
    const [showProgress, setShowProgress] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [showMyGoals, setShowMyGoals] = useState(false);
    const [todayGoals, setTodayGoals] = useState([]);
    const [newGoalText, setNewGoalText] = useState('');
    const [goalsLoading, setGoalsLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    // Load goals on mount
    useEffect(() => {
        const loadGoals = async () => {
            try {
                setGoalsLoading(true);
                const res = await axios.get(`${API_BASE}/stats/today-goals`, { withCredentials: true });
                setTodayGoals(res.data.goals || []);
            } catch (err) {
                console.error("Failed to load goals:", err);
                setTodayGoals([]);
            } finally {
                setGoalsLoading(false);
            }
        };
        loadGoals();
    }, []);

    // Add Goal
    const addTodayGoal = async () => {
        if (!newGoalText.trim()) return;

        try {
            const res = await axios.post(`${API_BASE}/stats/add-goal`, {
                text: newGoalText.trim()
            }, { withCredentials: true });

            setTodayGoals(res.data.allGoals);
            setNewGoalText('');
        } catch (err) {
            alert("Failed to add goal");
        }
    };

    // Toggle Complete
    const toggleGoalComplete = async (goalId) => {
        try {
            const res = await axios.put(
                `${API_BASE}/stats/today-goal/toggle-goal`,
                { goalId },
                { withCredentials: true }
            );

            // Safe check
            if (res.data.allGoals) {
                setTodayGoals(res.data.allGoals);
            }

            // Confetti only when completing (not unchecking)
            const updatedGoal = res.data.allGoals?.find(g => g.id === goalId);
            if (updatedGoal?.completed) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#e3002a', '#ff4757', '#ff6b6b', '#ffa502']
                });
            }
        } catch (err) {
            console.error("Toggle failed:", err);
            alert("Failed to update goal. Please try again.");
        }
    };

    // Delete Goal
    const deleteGoal = async (goalId) => {
        try {
            const res = await axios.delete(`${API_BASE}/stats/delete-goal`, {
                data: { goalId },
                withCredentials: true
            });

            setTodayGoals(res.data.allGoals);
        } catch (err) {
            alert("Failed to delete goal");
        }
    };
   const [achievements, setAchievements] = useState([]);
const [streak, setStreak] = useState(0);    const [lastWorkoutDate, setLastWorkoutDate] = useState(() => localStorage.getItem('challengeLastDate') || null);
    const [reminderEnabled, setReminderEnabled] = useState(() => JSON.parse(localStorage.getItem('challengeReminderEnabled') || 'false'));
    const [reminderHour, setReminderHour] = useState(() => localStorage.getItem('challengeReminderHour') || '18:00');
    const [weeklyProgress, setWeeklyProgress] = useState([]);

    const timerRef = useRef(null);
    const exerciseListRef = useRef(null);
    const reminderIntervalRef = useRef(null);

    // Safe current data
    const currentChallenge = challenges.find((c) => c.id === selectedChallengeId) || {
        id: null,
        title: 'Select a Challenge',
        description: 'Click any challenge card to start',
        thumbnail: '/challenge-default.jpg',
        totalDays: 0,
        totalCalories: '0',
        difficulty: 'Beginner',
        days: []
    };

    const days = currentChallenge.days || [];
    const currentDay = days[selectedDayIndex] || { exercises: [], title: 'Loading...' };
    const exercises = currentDay.exercises || [];

    // Total exercises across all challenges
    // Perfect counting: total exercises & completed
    const totalExercisesInCurrent = currentChallenge.totalExercises ||
        currentChallenge.days?.reduce((acc, d) => acc + (d.exercises?.length || 0), 0) || 0;

    const completedInCurrent = currentChallenge.days?.reduce((acc, day) =>
        acc + (day.exercises || []).filter(ex => completedExercises.includes(ex.id)).length, 0) || 0;

    let progressPercentage = 0;
    if (totalExercisesInCurrent > 0) {
        progressPercentage = Math.round((completedInCurrent / totalExercisesInCurrent) * 100);
    } else if (currentChallenge.totalCalories > 0) {
        // Fallback using calories if somehow no exercises
        const completedCal = currentChallenge.days?.reduce((sum, day) =>
            sum + (day.exercises || []).filter(ex => completedExercises.includes(ex.id))
                .reduce((s, ex) => s + (ex.calories || 0), 0), 0) || 0;
        progressPercentage = Math.round((completedCal / currentChallenge.totalCalories) * 100);
    }
    // Load Challenges from API
    useEffect(() => {
        const loadChallenges = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/challenges/user`, { withCredentials: true });
                const transformed = (res.data.challenges || []).map((ch) => {
                    // Accurate total calories calculation from all steps
                    const calculatedTotalCalories = (ch.days || []).reduce((sum, day) => {
                        return sum + (day.steps || day.exercises || []).reduce((s, step) => {
                            return s + (step.calories || 0);
                        }, 0);
                    }, 0);

                    const totalCalToShow = calculatedTotalCalories > 0 ? calculatedTotalCalories : 2800;

                    const daysTransformed = (ch.days || []).map((day, dayIdx) => ({
                        day: dayIdx + 1,
                        title: day.title || `Day ${dayIdx + 1}`,
                        exercises: (day.steps || day.exercises || []).map((step, stepIdx) => ({
                            id: step._id || `step_${dayIdx}_${stepIdx}_${Date.now()}`,
                            title: step.name || step.title || 'Exercise',
                            type: step.type || 'time',
                            time: step.duration || step.time || 30,
                            reps: step.reps || 12,
                            sets: step.sets || 3,
                            thumbnail: step.image || step.thumbnail || '/trainer-3.jpg',
                            description: step.description || step.notes || '',
                            calories: step.calories || 0,
                        }))
                    }));

                    // Total exercises for accurate progress
                    const totalExercises = daysTransformed.reduce((acc, d) => acc + d.exercises.length, 0);

                    return {
                        id: ch._id || ch.id,
                        title: ch.title || 'Challenge',
                        description: ch.description || '',
                        thumbnail: ch.thumbnail || '/challenge-default.jpg',
                        difficulty: ch.difficulty || 'Intermediate',
                        totalDays: daysTransformed.length || 1,
                        totalCalories: totalCalToShow,
                        totalExercises: totalExercises,  // ← New: for perfect counting
                        days: daysTransformed,
                    };
                });
                setChallenges(transformed);
                if (transformed.length > 0 && !selectedChallengeId) {
                    setSelectedChallengeId(transformed[0].id);
                }

                // Load saved progress
                const savedProgress = JSON.parse(localStorage.getItem('challengeProgress') || '[]');
                setCompletedExercises(savedProgress.map(p => p.exerciseId || p));
            } catch (err) {
                console.error('Failed to load challenges:', err);
                // Fallback demo challenge
                setChallenges([{
                    id: 'demo-challenge',
                    title: '30 Day Summer Body Challenge',
                    description: 'Get shredded in 30 days with daily intense workouts',
                    thumbnail: '/challenge-summer.jpg',
                    totalDays: 30,
                    totalCalories: '10500',
                    difficulty: 'Advanced',
                    days: [{
                        day: 1,
                        title: 'Day 1 - Full Body Blast',
                        exercises: [
                            { id: 'ex1', title: 'Burpees', type: 'reps', reps: 15, sets: 4, thumbnail: '/burpees.jpg' },
                            { id: 'ex2', title: 'Mountain Climbers', type: 'time', time: 45, thumbnail: '/climbers.jpg' },
                            { id: 'ex3', title: 'Push-ups', type: 'reps', reps: 20, sets: 3, thumbnail: '/pushup.jpg' }
                        ]
                    }]
                }]);
                setSelectedChallengeId('demo-challenge');
            } finally {
                setLoading(false);
            }
        };

        loadChallenges();
    }, []);

    // Weekly progress
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('challengeProgress') || '[]');
        const daysMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            daysMap[d.toDateString()] = 0;
        }
        saved.forEach(p => {
            const date = new Date(p.timestamp || Date.now()).toDateString();
            if (daysMap[date] !== undefined) daysMap[date]++;
        });
        setWeeklyProgress(Object.entries(daysMap).map(([day, count]) => ({ day, count })));
    }, [completedExercises]);

    // Timer
    useEffect(() => {
        if (!running) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => {
            setSecondsLeft(s => {
                if (s <= 1) {
                    clearInterval(timerRef.current);
                    finishExercise(true);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [running]);

    // Reminder
    useEffect(() => {
        if (reminderIntervalRef.current) clearInterval(reminderIntervalRef.current);
        if (reminderEnabled) {
            reminderIntervalRef.current = setInterval(() => {
                const now = new Date();
                const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                if (time === reminderHour) {
                    alert("Challenge Time! Keep the streak alive!");
                }
            }, 60000);
        }
    }, [reminderEnabled, reminderHour]);

    // Reset timer on exercise change
    useEffect(() => {
        const ex = exercises[currentIndex];
        setSecondsLeft(ex?.type === 'time' ? (ex.time || 30) : 30);
        setRunning(false);
    }, [currentIndex, selectedDayIndex, selectedChallengeId]);

    function togglePlay() {
        if (!exercises[currentIndex]) return;
        if (!running) {
            setRunning(true);
        } else {
            setRunning(false);
        }

    }

    async function finishExercise(auto = false) {
        const ex = exercises[currentIndex];
        if (!ex || completing) return;

        const challengeId = selectedChallengeId;
        if (!challengeId) return;

        // Local update pehle kar lo
        const newCompleted = Array.from(new Set([...completedExercises, ex.id]));
        setCompletedExercises(newCompleted);

        // LocalStorage save
        let progress = JSON.parse(localStorage.getItem('challengeProgress') || '[]');
        if (!completedExercises.includes(ex.id)) {
            let progress = JSON.parse(localStorage.getItem('challengeProgress') || '[]');

            if (!progress.some(p => p.exerciseId === ex.id && p.challengeId === challengeId)) {
                progress.push({
                    exerciseId: ex.id,
                    challengeId: challengeId,
                    timestamp: Date.now()
                });
                localStorage.setItem('challengeProgress', JSON.stringify(progress));
            }
        }

        const totalExercises = currentChallenge.totalExercises ||
            currentChallenge.days?.reduce((acc, d) => acc + (d.exercises?.length || 0), 0) || 0;
        const completedCount = newCompleted.length;
        const isFullyCompleted = totalExercises > 0 && completedCount >= totalExercises;

        console.log("🔍 DEBUG: Challenge Completion Check", {
            challengeId,
            totalExercises,
            completedCount,
            isFullyCompleted,
            daysCount: currentChallenge.days?.length || 0,
            exercisesInDays: (currentChallenge.days || []).map((d, i) => ({
                day: i + 1,
                exercisesLength: d.exercises?.length || 0
            }))
        });

        // Streak & Achievements
        const today = new Date().toDateString();
        if (lastWorkoutDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const newStreak = lastWorkoutDate === yesterday.toDateString() ? streak + 1 : 1;
            setStreak(newStreak);
            localStorage.setItem('challengeStreak', String(newStreak));
            localStorage.setItem('challengeLastDate', today);
            setLastWorkoutDate(today);
        }

        const ach = new Set(achievements);
        let shouldConfetti = false;

        if (newCompleted.length === 1) ach.add('first_ex');
        if (newCompleted.length >= 10) ach.add('ten_ex');
        if (streak >= 7) ach.add('week_streak');

        if (isFullyCompleted) {
            shouldConfetti = true;

            setCompleting(true);
            try {
                await axios.patch(
                    `${API_BASE}/challenges/${challengeId}/complete`,
                    { completedAt: new Date() },
                    { withCredentials: true }
                );
                console.log("✅ Full Challenge Completed & Saved to Backend!");
            } catch (err) {
                console.error("❌ Backend save failed:", err.response?.data || err.message);
                alert("Challenge completed locally! Will sync later.");
            } finally {
                setCompleting(false);
            }
        }

        // Day complete confetti
        const dayExercises = currentDay.exercises || [];
        const completedBeforeThis = dayExercises.filter(e => completedExercises.includes(e.id)).length;
        if (completedBeforeThis + 1 === dayExercises.length && dayExercises.length > 0) {
            shouldConfetti = true;
        }

        if (ach.size > achievements.length || shouldConfetti) {
            setAchievements(Array.from(ach));
            localStorage.setItem('challengeAchievements', JSON.stringify(Array.from(ach)));

            if (shouldConfetti) {
                confetti({
                    particleCount: 500,
                    spread: 130,
                    origin: { y: 0.58 },
                    colors: ['#e3002a', '#ff4757', '#ffa502', '#ffdd59', '#2ed573'],
                    scalar: 1.3,
                });
            }
        }

        setRunning(false);

        // Auto next
        const next = exercises.findIndex((e, i) => i > currentIndex && !newCompleted.includes(e.id));
        if (next !== -1) {
            setCurrentIndex(next);
            setTimeout(() => {
                document.getElementById(`ex-${exercises[next].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        } else if (selectedDayIndex < days.length - 1) {
            setSelectedDayIndex(selectedDayIndex + 1);
            setCurrentIndex(0);
        }
    }

    function repeatDay() {
        const dayExerciseIds = exercises.map(e => e.id);
        const filtered = completedExercises.filter(id => !dayExerciseIds.includes(id));
        setCompletedExercises(filtered);

        let progress = JSON.parse(localStorage.getItem('challengeProgress') || '[]');
        progress = progress.filter(p => !dayExerciseIds.includes(p.exerciseId));
        localStorage.setItem('challengeProgress', JSON.stringify(progress));

        setCurrentIndex(0);
    }

    function restartChallenge() {
        const challengeExerciseIds = currentChallenge.days?.flatMap(d => d.exercises.map(e => e.id)) || [];
        const filtered = completedExercises.filter(id => !challengeExerciseIds.includes(id));
        setCompletedExercises(filtered);

        let progress = JSON.parse(localStorage.getItem('challengeProgress') || '[]');
        progress = progress.filter(p => p.challengeId !== selectedChallengeId);
        localStorage.setItem('challengeProgress', JSON.stringify(progress));

        setSelectedDayIndex(0);
        setCurrentIndex(0);
    }

    const displayExercises = exercises.filter(ex =>
        (filter === 'All' || ex.section === filter) &&
        ex.title.toLowerCase().includes(query.toLowerCase())
    );

    const minutes = Math.floor(secondsLeft / 60);
    const secs = String(secondsLeft % 60).padStart(2, '0');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your challenges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6 md:p-10 rounded-lg">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">My Challenges</h1>
                        <p className="text-sm text-gray-500 mt-1">Premium challenges with streak, badges & rewards</p>
                        <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Flame size={16} color={THEME} />
                                <span>Streak: <strong>{streak}</strong> days</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BarChart2 size={16} color={THEME} />
                                <span>{progressPercentage}% complete</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <IconButton onClick={() => setShowProgress(true)} className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm">
                            <BarChart2 size={16} color={THEME} />
                            <span className="text-sm">Progress</span>
                        </IconButton>
                        <IconButton onClick={() => setShowAchievements(true)} className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm">
                            <Trophy size={16} color={THEME} />
                            <span className="text-sm">Badges</span>
                        </IconButton>
                        <IconButton onClick={() => setShowMyGoals(true)} className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm">
                            <Target size={18} color={THEME} />
                            <span className="text-sm font-medium">Today's Goals</span>
                        </IconButton>
                        <IconButton onClick={() => setReminderEnabled(!reminderEnabled)}
                            className={`flex items-center gap-2 bg-white border border-gray-100 shadow-sm ${reminderEnabled ? '' : 'opacity-60'}`}
                        >
                            <Bell size={16} color={reminderEnabled ? THEME : '#999'} />
                        </IconButton>
                        <IconButton onClick={repeatDay} className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm"
                            title="Repeat current day">
                            <Repeat size={16} color={THEME} />
                        </IconButton>
                        <IconButton onClick={restartChallenge} className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm"
                            title="Restart challenge">
                            <RefreshCw size={16} color={THEME} />
                        </IconButton>
                    </div>
                </div>

                {/* Challenge Cards */}
                {challenges.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl">
                        <Trophy size={80} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Challenges Yet!</h2>
                        <p className="text-gray-500">New challenges coming soon...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-3">
                        {challenges.map((c) => (
                            <ChallengeCard
                                key={c.id}
                                challenge={c}
                                active={c.id === selectedChallengeId}
                                onClick={() => {
                                    setSelectedChallengeId(c.id);
                                    setSelectedDayIndex(0);
                                    setCurrentIndex(0);
                                    setQuery('');
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Challenge Overview */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_18px_40px_rgba(14,20,30,0.06)] border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-2">
                            <h2 className="text-2xl font-bold text-gray-900">{currentChallenge.title}</h2>
                            <p className="text-gray-600 mt-2">{currentChallenge.description}</p>
                            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                                <div className="p-3 rounded-lg flex items-center gap-2 border border-gray-100 shadow-sm"><Clock size={16} color={THEME} /> {currentChallenge.totalDays} days</div>
                                <div className="p-3 rounded-lg flex items-center gap-2 border border-gray-100 shadow-sm"><Zap size={16} color={THEME} /> {currentChallenge.totalCalories} kcal</div>
                                <div className="p-3 rounded-lg flex items-center gap-2 border border-gray-100 shadow-sm"><Calendar size={16} color={THEME} /> {currentChallenge.difficulty}</div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <Progress percent={progressPercentage} status="active" strokeColor={THEME} />
                            <div className="text-sm text-gray-500">{completedInCurrent} / {totalExercisesInCurrent} exercises</div>                            <button onClick={() => setShowProgress(true)} className="w-full py-2 rounded-lg bg-red-600 text-white font-medium" style={{ background: THEME }}>
                                View detailed progress
                            </button>
                        </div>
                    </div>
                </div>

                {/* Day Selector */}
                {days.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {days.map((d, idx) => {
                            const dayExercises = d.exercises || [];
                            const status =
                                dayExercises.length === 0
                                    ? 'rest'
                                    : dayExercises.every((ex) => completedExercises.includes(ex.id))
                                        ? 'completed'
                                        : dayExercises.some((ex) => completedExercises.includes(ex.id))
                                            ? 'in-progress'
                                            : 'pending';
                            const bg =
                                selectedDayIndex === idx
                                    ? 'bg-red-600 text-white'
                                    : status === 'completed'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-white text-gray-700';

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setSelectedDayIndex(idx);
                                        setCurrentIndex(0);
                                        setQuery('');
                                    }}
                                    className={`px-4 py-2 rounded-full shadow-sm border ${bg}`}
                                >
                                    Day {d.day}
                                    {status === 'completed' && <CheckCircle size={14} className="inline ml-2" />}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {['All', 'Workout', 'Warm-up', 'Cool-down'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-full border ${filter === s ? 'bg-red-600 text-white' : 'bg-white'}`}
                                style={filter === s ? { background: THEME } : {}}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search exercises..."
                        className="px-4 py-2 rounded-full border border-gray-200 w-full md:w-80"
                    />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Exercise List */}
                    <main ref={exerciseListRef} className="md:col-span-5 bg-white rounded-2xl p-6 shadow-sm max-h-[640px] overflow-y-auto border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Day {currentDay.day} • {currentDay.title}</h3>
                            <div className="text-sm text-gray-500">{displayExercises.length} exercises</div>
                        </div>
                        <div className="space-y-3">
                            {displayExercises.length === 0 && (
                                <div className="py-8 text-center text-gray-500">
                                    <div className="text-2xl">Rest Day</div>
                                    <div className="mt-3 font-medium">Recovery is progress too</div>
                                </div>
                            )}
                            {displayExercises.map((ex, idx) => (
                                <motion.div
                                    layout
                                    id={`ex-${ex.id}`}
                                    key={ex.id}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${exercises[currentIndex]?.id === ex.id ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm">
                                            <img src={ex.thumbnail || '/trainer-3.jpg'} alt={ex.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-800 flex items-center gap-2">
                                                {ex.title}
                                                {completedExercises.includes(ex.id) && <CheckCircle size={16} color={THEME} />}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {ex.type === 'time' ? `${ex.time}s` : `${ex.reps} reps × ${ex.sets || 1} sets`}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">{ex.description}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">{ex.section || 'Workout'}</div>
                                </motion.div>
                            ))}
                        </div>
                    </main>

                    {/* Player */}
                    <aside className="md:col-span-7 bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-6 border border-gray-100">
                        <div className="text-center">
                            <div className="text-sm text-gray-500">Current Exercise</div>
                            <div className="text-5xl font-bold text-red-600 mt-2" style={{ color: THEME }}>
                                {String(minutes).padStart(2, '0')}:{secs}
                            </div>
                            <div className="text-xl font-semibold text-gray-800 mt-2">
                                {exercises[currentIndex]?.title || 'Select an exercise'}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                {exercises[currentIndex]?.description}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-gray-50 h-80 md:h-96 flex items-center justify-center overflow-hidden shadow-inner">
                            <img
                                src={exercises[currentIndex]?.thumbnail || '/trainer-3.jpg'}
                                alt="Exercise"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={togglePlay}
                                    className={`py-3 rounded-full flex items-center justify-center gap-2 font-medium ${running ? 'bg-red-600 text-white' : 'bg-white border border-gray-200'}`}
                                    style={running ? { background: THEME } : {}}
                                >
                                    {running ? <Pause size={16} /> : <Play size={16} />} {running ? 'Pause' : 'Start'}
                                </button>
                                <button
                                    onClick={() => {
                                        const currentEx = exercises[currentIndex];
                                        if (!currentEx) return;

                                        // Agar already completed hai to kuch mat karo
                                        if (completedExercises.includes(currentEx.id)) {
                                            return; // ya alert("Already completed!");
                                        }

                                        finishExercise(true);
                                    }}
                                    disabled={completing || completedExercises.includes(exercises[currentIndex]?.id)}
                                    className="py-3 rounded-full bg-red-600 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
                                    style={{
                                        background: THEME,
                                        opacity: completedExercises.includes(exercises[currentIndex]?.id) ? 0.6 : 1
                                    }}
                                >
                                    {completing
                                        ? 'Saving...'
                                        : completedExercises.includes(exercises[currentIndex]?.id)
                                            ? 'Completed ✓'
                                            : 'Mark Complete'
                                    }
                                </button>
                                <button
                                    onClick={() => {
                                        // Skip = NO completion, sirf next jaao
                                        const nextIndex = currentIndex + 1;
                                        if (nextIndex < exercises.length) {
                                            setCurrentIndex(nextIndex);
                                            setTimeout(() => {
                                                document.getElementById(`ex-${exercises[nextIndex].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }, 100);
                                        } else if (selectedDayIndex < days.length - 1) {
                                            setSelectedDayIndex(selectedDayIndex + 1);
                                            setCurrentIndex(0);
                                        }
                                        setRunning(false); // timer stop
                                    }}
                                    className="py-3 rounded-full bg-yellow-500 text-white font-medium"
                                >
                                    Skip
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="flex-1 py-3 bg-white border border-gray-200 rounded-full">
                                    Previous
                                </button>
                                <button
                                    onClick={() => setSelectedDayIndex(Math.min(days.length - 1, selectedDayIndex + 1))}
                                    className="flex-1 py-3 bg-white border border-gray-200 rounded-full"
                                >
                                    Next Day
                                </button>
                            </div>
                        </>

                        {/* Progress Modal */}
                        <AnimatePresence>
                            {showProgress && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                                    onClick={() => setShowProgress(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0.95 }}
                                        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-bold">Challenge Progress</h3>
                                            <button onClick={() => setShowProgress(false)} className="text-gray-500 p-2">
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="flex flex-col items-center mt-6">
                                            <Progress type="circle" percent={progressPercentage} width={120} strokeColor={THEME} />
                                            <div className="text-gray-600 mt-3 text-lg">{progressPercentage}% completed</div>
                                        </div>

                                        <div className="mt-6 space-y-2">
                                            {days.map((d, i) => {
                                                const exs = d.exercises || [];
                                                const completed = exs.filter((ex) => completedExercises.includes(ex.id)).length;
                                                const total = exs.length;
                                                return (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <div>Day {d.day} • {d.title}</div>
                                                        <div className={completed === total ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                                            {completed === total ? 'Completed' : `${completed}/${total}`}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6">
                                            <h4 className="font-semibold mb-2">Last 7 days</h4>
                                            <div className="flex gap-2">
                                                {weeklyProgress.map((w) => (
                                                    <div key={w.day} className="flex flex-col items-center text-xs">
                                                        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100">
                                                            {w.count}
                                                        </div>
                                                        <div className="mt-1 text-gray-400">
                                                            {new Date(w.day).toLocaleDateString(undefined, { weekday: 'short' })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <label className="text-sm text-gray-600">Daily reminder:</label>
                                            <div className="flex items-center gap-2 mt-2">
                                                <input type="time" value={reminderHour} onChange={(e) => setReminderHour(e.target.value)} className="px-2 py-1 border rounded" />
                                                <button onClick={() => setReminderEnabled(!reminderEnabled)} className={`px-3 py-1 rounded ${reminderEnabled ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                                                    {reminderEnabled ? 'On' : 'Off'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Achievements Modal */}
                        <AnimatePresence>
                            {showAchievements && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                                    onClick={() => setShowAchievements(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0.95 }}
                                        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <Trophy size={18} /> My Badges
                                            </h3>
                                            <button onClick={() => setShowAchievements(false)} className="text-gray-500 p-2">
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="mt-6 grid grid-cols-1 gap-3">
                                            {[
                                                { id: 'first_ex', title: 'First Exercise', desc: 'Completed your first exercise' },
                                                { id: 'ten_ex', title: '10 Exercises', desc: 'Completed 10 exercises' },
                                                { id: 'week_streak', title: '7 Day Streak', desc: 'Worked out 7 days in a row' }
                                            ].map((b) => {
                                                const unlocked = achievements.includes(b.id);
                                                return (
                                                    <div key={b.id} className={`p-3 rounded-lg border ${unlocked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-semibold">{b.title}</div>
                                                                <div className="text-xs text-gray-500">{b.desc}</div>
                                                            </div>
                                                            <div className="text-sm">
                                                                {unlocked ? <span className="text-green-600 font-medium">Unlocked</span> : <span className="text-gray-400">Locked</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4 text-sm text-gray-500">Streak: <strong>{streak}</strong> days</div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Today's Custom Goals Modal */}
                        <AnimatePresence>
                            {showMyGoals && (
                                <motion.div
                                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowMyGoals(false)}
                                >
                                    <motion.div
                                        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100"
                                        initial={{ scale: 0.95, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.95, y: 20 }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Header */}
                                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center rounded-t-3xl">
                                            <div>
                                                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                                                    🏋️ Today’s Fitness Goals
                                                </h2>
                                                <p className="text-sm text-gray-500">Stay consistent, stay strong 🔥</p>
                                            </div>
                                            <button
                                                onClick={() => setShowMyGoals(false)}
                                                className="p-2 rounded-xl hover:bg-gray-100 transition"
                                            >
                                                <X size={24} className="text-gray-500" />
                                            </button>
                                        </div>

                                        {/* Body */}
                                        <div className="p-6 space-y-6">

                                            {/* Add Goal Input */}
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={newGoalText}
                                                    onChange={(e) => setNewGoalText(e.target.value)}
                                                    onKeyPress={(e) => e.key === "Enter" && addTodayGoal()}
                                                    placeholder="e.g., Run 5km, Drink 3L water, 50 push-ups..."
                                                    className="flex-1 px-5 py-3 rounded-xl text-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                                                />
                                                <button
                                                    onClick={addTodayGoal}
                                                    className="px-6 py-3 rounded-xl font-semibold text-white shadow-md hover:opacity-90 transition"
                                                    style={{ background: THEME }}
                                                >
                                                    Add
                                                </button>
                                            </div>

                                            {/* Goals List */}
                                            {goalsLoading ? (
                                                <div className="text-center py-12 text-gray-500">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
                                                    <p>Loading your goals...</p>
                                                </div>
                                            ) : todayGoals.length === 0 ? (
                                                <div className="text-center py-12 text-gray-400">
                                                    <Target size={60} className="mx-auto mb-4 opacity-40" />
                                                    <p className="text-lg font-medium text-gray-600">No goals for today</p>
                                                    <p className="text-sm">Let’s set some goals and get moving 💪</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {todayGoals.map((goal) => (
                                                        <motion.div
                                                            key={goal.id}
                                                            layout
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 20 }}
                                                            className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm transition ${goal.completed
                                                                ? "bg-green-50 border-green-200 line-through opacity-80"
                                                                : "bg-white border-gray-200"
                                                                }`}
                                                        >
                                                            <button
                                                                onClick={() => toggleGoalComplete(goal.id)}
                                                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${goal.completed
                                                                    ? "bg-green-500 border-green-500"
                                                                    : "border-gray-400 hover:border-red-500"
                                                                    }`}
                                                            >
                                                                {goal.completed && <CheckCircle size={18} className="text-white" />}
                                                            </button>

                                                            <span className="flex-1 text-lg font-medium text-gray-800">
                                                                {goal.text}
                                                            </span>

                                                            <button
                                                                onClick={() => deleteGoal(goal.id)}
                                                                className="text-gray-400 hover:text-red-500"
                                                            >
                                                                <X size={22} />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}

                                            {todayGoals.length > 0 && (
                                                <div className="mt-10 pt-8 border-t-2 border-gray-100">
                                                    {/* Header */}
                                                    <div className="mb-8 text-center">
                                                        <p className="text-2xl font-bold text-gray-900">Today&apos;s Goals Progress</p>
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            {todayGoals.filter(g => g.completed).length} of {todayGoals.length} completed
                                                        </p>
                                                    </div>

                                                    <div className="space-y-6">
                                                        {todayGoals.map((goal) => (
                                                            <motion.div
                                                                key={goal.id}
                                                                layout
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className={`rounded-2xl p-5 shadow-sm border transition-all ${goal.completed
                                                                    ? "bg-green-50 border-green-300"
                                                                    : "bg-white border-gray-200"
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <span className={`text-lg font-medium ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                                        {goal.text}
                                                                    </span>
                                                                    {goal.completed && (
                                                                        <CheckCircle size={24} className="text-green-600" fill="#16a34a" />
                                                                    )}
                                                                </div>

                                                                {/* Progress Bar – Sirf 0% ya 100% */}
                                                                <div className="relative h-5 bg-gray-200 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: goal.completed ? "100%" : "0%" }}
                                                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                                                        className="h-full rounded-full"
                                                                        style={{
                                                                            background: goal.completed
                                                                                ? "linear-gradient(90deg, #16a34a, #22c55e)"
                                                                                : "#e5e7eb"
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div className="mt-3 flex justify-between items-center">
                                                                    <span className="text-sm font-medium text-gray-600">
                                                                        {goal.completed ? "Completed" : "Not Started"}
                                                                    </span>
                                                                    <span className="text-lg font-bold" style={{ color: goal.completed ? "#16a34a" : THEME }}>
                                                                        {goal.completed ? "100%" : "0%"}
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                    {/* Overall Summary */}
                                                    <div className="mt-10 p-5 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-lg font-bold text-gray-800">Overall Daily Progress</span>
                                                            <span className="text-3xl font-extrabold" style={{ color: THEME }}>
                                                                {Math.round((todayGoals.filter(g => g.completed).length / todayGoals.length) * 100)}%
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            percent={(todayGoals.filter(g => g.completed).length / todayGoals.length) * 100}
                                                            strokeColor={THEME}
                                                            showInfo={false}
                                                            style={{ height: 14 }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="bg-gray-50 px-6 py-4 rounded-b-3xl text-center text-sm text-gray-600">
                                            🚀 Consistency builds champions. Keep going!
                                        </div>

                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>


                    </aside>
                </div>
            </div>
        </div >
    );
}