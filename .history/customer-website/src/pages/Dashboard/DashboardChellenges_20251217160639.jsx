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
    const [filter, setFilter] = useState('All');
    const [query, setQuery] = useState('');
    const [showProgress, setShowProgress] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [showMyGoals, setShowMyGoals] = useState(false);

    // Backend progress
    const [progressData, setProgressData] = useState({
        completedExercises: [],
        streak: 0,
        achievements: [],
    });

    // Today's Goals
    const [todayGoals, setTodayGoals] = useState([]);
    const [newGoalText, setNewGoalText] = useState('');
    const [goalsLoading, setGoalsLoading] = useState(true);

    // Reminder (localStorage – harmless)
    const [reminderEnabled, setReminderEnabled] = useState(() => JSON.parse(localStorage.getItem('challengeReminderEnabled') || 'false'));
    const [reminderHour, setReminderHour] = useState(() => localStorage.getItem('challengeReminderHour') || '18:00');

    const timerRef = useRef(null);
    const reminderIntervalRef = useRef(null);

    // Current challenge
    const currentChallenge = challenges.find(c => c.id === selectedChallengeId) || {
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
    const currentDay = days[selectedDayIndex] || { exercises: [], title: 'Rest Day' };
    const exercises = currentDay.exercises || [];

    const totalExercisesInCurrent = currentChallenge.totalExercises ||
        currentChallenge.days?.reduce((acc, d) => acc + (d.exercises?.length || 0), 0) || 0;
    const completedInCurrent = currentChallenge.days?.reduce((acc, day) =>
        acc + (day.exercises || []).filter(ex => progressData.completedExercises.includes(ex.id)).length, 0) || 0;
    const progressPercentage = totalExercisesInCurrent === 0 ? 0 : Math.round((completedInCurrent / totalExercisesInCurrent) * 100);

    // Load challenges + first progress
    useEffect(() => {
        const loadChallenges = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/challenges/user`, { withCredentials: true });
                const transformed = (res.data.challenges || []).map(ch => {
                    const calculatedTotalCalories = (ch.days || []).reduce((sum, day) => {
                        return sum + (day.steps || day.exercises || []).reduce((s, step) => s + (step.calories || 0), 0);
                    }, 0);
                    const totalCalToShow = calculatedTotalCalories > 0 ? calculatedTotalCalories : 2800;

                    const daysTransformed = (ch.days || []).map((day, dayIdx) => ({
                        day: dayIdx + 1,
                        title: day.title || `Day ${dayIdx + 1}`,
                        exercises: (day.steps || day.exercises || []).map(step => ({
                            id: step._id.toString(),
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

                    const totalExercises = daysTransformed.reduce((acc, d) => acc + d.exercises.length, 0);

                    return {
                        id: ch._id,
                        title: ch.title || 'Challenge',
                        description: ch.description || '',
                        thumbnail: ch.thumbnail || '/challenge-default.jpg',
                        difficulty: ch.difficulty || 'Intermediate',
                        totalDays: daysTransformed.length || 1,
                        totalCalories: totalCalToShow,
                        totalExercises,
                        days: daysTransformed,
                    };
                });

                setChallenges(transformed);

                if (transformed.length > 0) {
                    const first = transformed[0];
                    setSelectedChallengeId(first.id);
                    await loadProgress(first.id);
                }
            } catch (err) {
                console.error('Load challenges failed:', err);
                setChallenges([]);
            } finally {
                setLoading(false);
            }
        };

        const loadProgress = async (challengeId) => {
            try {
                const res = await axios.get(`${API_BASE}/challenges/${challengeId}/progress`, { withCredentials: true });
                setProgressData(res.data.progress || { completedExercises: [], streak: 0, achievements: [] });
            } catch (err) {
                setProgressData({ completedExercises: [], streak: 0, achievements: [] });
            }
        };

        loadChallenges();
    }, []);

    // Load today's goals
    useEffect(() => {
        const loadGoals = async () => {
            try {
                setGoalsLoading(true);
                const res = await axios.get(`${API_BASE}/stats/today-goals`, { withCredentials: true });
                setTodayGoals(res.data.goals || []);
            } catch (err) {
                console.error("Failed to load goals:", err);
            } finally {
                setGoalsLoading(false);
            }
        };
        loadGoals();
    }, []);

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

    useEffect(() => {
        const ex = exercises[currentIndex];
        setSecondsLeft(ex?.type === 'time' ? (ex.time || 30) : 30);
        setRunning(false);
    }, [currentIndex, selectedDayIndex, selectedChallengeId]);

    function togglePlay() {
        if (!exercises[currentIndex]) return;
        setRunning(prev => !prev);
    }

    async function finishExercise(auto = false) {
        const ex = exercises[currentIndex];
        if (!ex || !selectedChallengeId) return;

        const newCompleted = Array.from(new Set([...progressData.completedExercises, ex.id]));
        setProgressData(prev => ({ ...prev, completedExercises: newCompleted }));

        axios.post(`${API_BASE}/challenges/progress`, {
            challengeId: selectedChallengeId,
            completedExerciseId: ex.id,
        }, { withCredentials: true })
            .then(res => {
                setProgressData(res.data.progress);
            })
            .catch(err => console.error('Save failed', err));

        // Day complete confetti
        const dayCompleted = currentDay.exercises.every(e => newCompleted.includes(e.id));
        if (dayCompleted && currentDay.exercises.length > 0) {
            confetti({
                particleCount: 500,
                spread: 130,
                origin: { y: 0.58 },
                colors: ['#e3002a', '#ff4757', '#ffa502', '#ffdd59', '#2ed573'],
                scalar: 1.3,
            });
        }

        // Full challenge complete
        const allCompleted = currentChallenge.days?.every(d =>
            d.exercises.every(e => newCompleted.includes(e.id))
        );
        if (allCompleted && totalExercisesInCurrent > 0) {
            confetti({
                particleCount: 800,
                spread: 160,
                origin: { y: 0.5 },
                colors: ['#e3002a', '#ff4757', '#ffa502', '#ffdd59', '#2ed573', '#1e90ff'],
            });
            try {
                await axios.post(`${API_BASE}/challenges/${selectedChallengeId}/complete`, {}, { withCredentials: true });
            } catch (err) {
                console.error('Full completion save failed', err);
            }
        }

        setRunning(false);

        // Auto advance
        const next = exercises.findIndex((e, i) => i > currentIndex && !newCompleted.includes(e.id));
        if (next !== -1) {
            setCurrentIndex(next);
            setTimeout(() => document.getElementById(`ex-${exercises[next].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
        } else if (selectedDayIndex < days.length - 1) {
            setSelectedDayIndex(selectedDayIndex + 1);
            setCurrentIndex(0);
        }
    }

    function repeatDay() {
        const dayIds = currentDay.exercises.map(e => e.id);
        const filtered = progressData.completedExercises.filter(id => !dayIds.includes(id));

        setProgressData(prev => ({ ...prev, completedExercises: filtered }));

        axios.post(`${API_BASE}/challenges/progress`, {
            challengeId: selectedChallengeId,
            completedExercises: filtered,
        }, { withCredentials: true });

        setCurrentIndex(0);
    }

    function restartChallenge() {
        setProgressData(prev => ({ ...prev, completedExercises: [] }));

        axios.post(`${API_BASE}/challenges/progress`, {
            challengeId: selectedChallengeId,
            completedExercises: [],
        }, { withCredentials: true });

        setSelectedDayIndex(0);
        setCurrentIndex(0);
    }

    // Goal functions
    const addTodayGoal = async () => {
        if (!newGoalText.trim()) return;
        try {
            const res = await axios.post(`${API_BASE}/stats/add-goal`, { text: newGoalText.trim() }, { withCredentials: true });
            setTodayGoals(res.data.allGoals);
            setNewGoalText('');
        } catch (err) {
            alert("Failed to add goal");
        }
    };

    const toggleGoalComplete = async (goalId) => {
        try {
            const res = await axios.put(`${API_BASE}/stats/today-goal/toggle-goal`, { goalId }, { withCredentials: true });
            setTodayGoals(res.data.allGoals);
            const goal = res.data.allGoals.find(g => g.id === goalId);
            if (goal?.completed) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#e3002a', '#ff4757'] });
            }
        } catch (err) {
            alert("Failed to update goal");
        }
    };

    const deleteGoal = async (goalId) => {
        try {
            const res = await axios.delete(`${API_BASE}/stats/delete-goal`, { data: { goalId }, withCredentials: true });
            setTodayGoals(res.data.allGoals);
        } catch (err) {
            alert("Failed to delete goal");
        }
    };

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
                                <span>Streak: <strong>{progressData.streak}</strong> days</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BarChart2 size={16} color={THEME} />
                                <span>{progressPercentage}% complete</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <IconButton onClick={() => setShowProgress(true)}>
                            <BarChart2 size={16} color={THEME} />
                            <span className="text-sm">Progress</span>
                        </IconButton>
                        <IconButton onClick={() => setShowAchievements(true)}>
                            <Trophy size={16} color={THEME} />
                            <span className="text-sm">Badges</span>
                        </IconButton>
                        <IconButton onClick={() => setShowMyGoals(true)}>
                            <Target size={18} color={THEME} />
                            <span className="text-sm font-medium">Today's Goals</span>
                        </IconButton>
                        <IconButton onClick={() => setReminderEnabled(!reminderEnabled)}>
                            <Bell size={16} color={reminderEnabled ? THEME : '#999'} />
                        </IconButton>
                        <IconButton onClick={repeatDay} title="Repeat current day">
                            <Repeat size={16} color={THEME} />
                        </IconButton>
                        <IconButton onClick={restartChallenge} title="Restart challenge">
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
                        {challenges.map(c => (
                            <ChallengeCard
                                key={c.id}
                                challenge={c}
                                active={c.id === selectedChallengeId}
                                onClick={async () => {
                                    setSelectedChallengeId(c.id);
                                    setSelectedDayIndex(0);
                                    setCurrentIndex(0);
                                    setQuery('');

                                    try {
                                        const res = await axios.get(`${API_BASE}/challenges/${c.id}/progress`, { withCredentials: true });
                                        setProgressData(res.data.progress || { completedExercises: [], streak: 0, achievements: [] });
                                    } catch (err) {
                                        setProgressData({ completedExercises: [], streak: 0, achievements: [] });
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Challenge Overview */}
                {selectedChallengeId && (
                    <div className="bg-white rounded-2xl p-6 shadow-[0_18px_40px_rgba(14,20,30,0.06)] border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <div className="md:col-span-2">
                                <h2 className="text-2xl font-bold text-gray-900">{currentChallenge.title}</h2>
                                <p className="text-gray-600 mt-2">{currentChallenge.description}</p>
                                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                                    <div className="p-3 rounded-lg flex items-center gap-2 border border-gray-100 shadow-sm">
                                        <Clock size={16} color={THEME} /> {currentChallenge.totalDays} days
                                    </div>
                                    <div className="p-3 rounded-lg flex items-center gap-2 border border-gray-100 shadow-sm">
                                        <Zap size={16} color={THEME} /> {currentChallenge.totalCalories} kcal
                                    </div>
                                    <div className="p-3 rounded-lg flex items-center gap-2 border border-gray-100 shadow-sm">
                                        <Calendar size={16} color={THEME} /> {currentChallenge.difficulty}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <Progress percent={progressPercentage} status="active" strokeColor={THEME} />
                                <div className="text-sm text-gray-500">{completedInCurrent} / {totalExercisesInCurrent} exercises</div>
                                <button onClick={() => setShowProgress(true)} className="w-full py-2 rounded-lg text-white font-medium" style={{ background: THEME }}>
                                    View detailed progress
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Day Selector */}
                {days.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {days.map((d, idx) => {
                            const status = d.exercises.length === 0 ? 'rest' :
                                d.exercises.every(ex => progressData.completedExercises.includes(ex.id)) ? 'completed' :
                                    d.exercises.some(ex => progressData.completedExercises.includes(ex.id)) ? 'in-progress' : 'pending';
                            const bg = selectedDayIndex === idx ? 'bg-red-600 text-white' :
                                status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700';

                            return (
                                <button
                                    key={idx}
                                    onClick={() => { setSelectedDayIndex(idx); setCurrentIndex(0); setQuery(''); }}
                                    className={`px-4 py-2 rounded-full shadow-sm border ${bg}`}
                                    style={selectedDayIndex === idx ? { background: THEME } : {}}
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
                        {['All', 'Workout', 'Warm-up', 'Cool-down'].map(s => (
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
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search exercises..."
                        className="px-4 py-2 rounded-full border border-gray-200 w-full md:w-80"
                    />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <main className="md:col-span-5 bg-white rounded-2xl p-6 shadow-sm max-h-[640px] overflow-y-auto border border-gray-100">
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
                            {displayExercises.map((ex) => (
                                <motion.div
                                    layout
                                    key={ex.id}
                                    id={`ex-${ex.id}`}
                                    onClick={() => setCurrentIndex(exercises.indexOf(ex))}
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${exercises[currentIndex]?.id === ex.id ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm">
                                            <img src={ex.thumbnail || '/trainer-3.jpg'} alt={ex.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-800 flex items-center gap-2">
                                                {ex.title}
                                                {progressData.completedExercises.includes(ex.id) && <CheckCircle size={16} color={THEME} />}
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
                                <button onClick={togglePlay}
                                    className={`py-3 rounded-full flex items-center justify-center gap-2 font-medium ${running ? 'bg-red-600 text-white' : 'bg-white border border-gray-200'}`}
                                    style={running ? { background: THEME } : {}}>
                                    {running ? <Pause size={16} /> : <Play size={16} />} {running ? 'Pause' : 'Start'}
                                </button>
                                <button
                                    onClick={() => finishExercise(true)}
                                    disabled={progressData.completedExercises.includes(exercises[currentIndex]?.id)}
                                    className={`py-3 rounded-full font-medium transition ${progressData.completedExercises.includes(exercises[currentIndex]?.id)
                                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                            : 'text-white'
                                        }`}
                                    style={{ background: progressData.completedExercises.includes(exercises[currentIndex]?.id) ? '#e300' : THEME }}
                                >
                                    {progressData.completedExercises.includes(exercises[currentIndex]?.id) ? 'Completed ✓' : 'Mark Complete'}
                                </button>
                                <button onClick={() => finishExercise(true)} className="py-3 rounded-full bg-yellow-500 text-white font-medium">
                                    Skip
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="flex-1 py-3 bg-white border border-gray-200 rounded-full">
                                    Previous
                                </button>
                                <button onClick={() => setSelectedDayIndex(Math.min(days.length - 1, selectedDayIndex + 1))} className="flex-1 py-3 bg-white border border-gray-200 rounded-full">
                                    Next Day
                                </button>
                            </div>
                        </>
                    </aside>
                </div>
            </div>

            {/* Progress Modal */}
            <AnimatePresence>
                {showProgress && (
                    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowProgress(false)}>
                        <motion.div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold">Challenge Progress</h3>
                                <button onClick={() => setShowProgress(false)}><X size={20} /></button>
                            </div>
                            <div className="flex flex-col items-center mt-6">
                                <Progress type="circle" percent={progressPercentage} width={120} strokeColor={THEME} />
                                <div className="text-gray-600 mt-3 text-lg">{progressPercentage}% completed</div>
                            </div>
                            <div className="mt-6 space-y-2">
                                {days.map((d, i) => {
                                    const completed = d.exercises.filter(ex => progressData.completedExercises.includes(ex.id)).length;
                                    const total = d.exercises.length;
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Achievements Modal */}
            <AnimatePresence>
                {showAchievements && (
                    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowAchievements(false)}>
                        <motion.div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Trophy size={18} /> My Badges
                                </h3>
                                <button onClick={() => setShowAchievements(false)}><X size={20} /></button>
                            </div>
                            <div className="mt-6 grid grid-cols-1 gap-3">
                                {[
                                    { id: 'first_ex', title: 'First Exercise', desc: 'Completed your first exercise' },
                                    { id: 'ten_ex', title: '10 Exercises', desc: 'Completed 10 exercises' },
                                    { id: 'seven_day_streak', title: '7 Day Streak', desc: 'Worked out 7 days in a row' }
                                ].map(b => {
                                    const unlocked = progressData.achievements.includes(b.id);
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
                            <div className="mt-4 text-sm text-gray-500">Streak: <strong>{progressData.streak}</strong> days</div>
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

                         

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
        
    );
}