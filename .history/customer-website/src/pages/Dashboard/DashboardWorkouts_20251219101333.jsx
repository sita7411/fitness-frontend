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

function ProgramCard({ program, active, onClick }) {
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
          src={program.thumbnail || '/trainer-3.jpg'}
          alt={program.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute left-4 bottom-4 text-white">
          <div className="text-xs tracking-wide opacity-90">
            {program.subtitle}
          </div>
          <div className="text-xl font-semibold leading-snug drop-shadow-md">
            {program.title}
          </div>
        </div>
      </div>
      <div className="p-4 bg-white">
        <div className="text-sm text-gray-500">
          {program.duration} • {program.level}
        </div>
        <div className="mt-4 flex gap-3 text-xs">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            <Clock size={14} />
            {program.duration}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            <Zap size={14} />
            {program.calories}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyWorkouts() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [heartRate, setHeartRate] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState('18:00');
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [backendWorkoutMinutes, setBackendWorkoutMinutes] = useState(0);
  const achievementDefs = {
    first_ex: { title: 'First Exercise', desc: 'Completed your first exercise' },
    ten_ex: { title: '10 Exercises', desc: 'Completed 10 exercises' },
    seven_day_streak: { title: '7 Day Streak', desc: 'Worked out 7 days in a row' }
  };

  const [achievements, setAchievements] = useState([]);
  const timerRef = useRef(null);
  const exerciseListRef = useRef(null);

  const currentProgram = programs.find((p) => p.id === selectedProgramId) || {
    id: null,
    title: 'Select a Program',
    description: 'Click any program card to start',
    duration: '30-45 min',
    calories: '300-450 Kal',
    level: 'Beginner',
    equipment: [],
    totalDays: 0,
    days: [],
  };

  const days = currentProgram.days || [];
  const currentDay = days[selectedDayIndex] || { exercises: [], day: 1, title: 'Loading...' };
  const exercises = currentDay.exercises || [];

  const totalExercisesInCurrentProgram = currentProgram.days?.reduce((acc, day) =>
    acc + (day.exercises?.length || 0), 0) || 0;

  const completedInCurrentProgram = currentProgram.days?.reduce((acc, day) =>
    acc + day.exercises.filter(ex => completedExercises.includes(ex.id)).length, 0) || 0;

  const progressPercentage = totalExercisesInCurrentProgram === 0
    ? 0
    : Math.round((completedInCurrentProgram / totalExercisesInCurrentProgram) * 100);

  // Helper: Calculate total estimated seconds for the day
  const calculateDayWorkoutSeconds = () => {
    return currentDay.exercises.reduce((sum, ex) => {
      if (ex.type === 'time') return sum + (ex.time || 0);
      return sum + ((ex.reps || 12) * (ex.sets || 3) * 3); // ~3 sec per rep
    }, 0);
  };

  // Fetch today's workout minutes
  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/stats/today`, { withCredentials: true });
        setBackendWorkoutMinutes(res.data.workoutMinutes || 0);
      } catch (err) {
        console.log("Could not fetch workout minutes");
      }
    };
    fetchTodayStats();
  }, []);

  // Load programs
  useEffect(() => {
    const loadPrograms = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/programs/user`, { withCredentials: true });
        const transformed = res.data.programs.map((p) => ({
          id: p.id || p._id,
          title: p.title,
          subtitle: `${p.trainingType || 'Full Body'} • ${p.totalDays || 7} days`,
          description: p.desc || '',
          duration: p.duration || '30-45 min',
          calories: `${p.caloriesBurned || 300}-450 Kal`,
          level: p.difficulty || 'Beginner',
          thumbnail: p.thumbnail || null,
          equipment: p.equipment || [],
          totalDays: p.totalDays || 7,
          days: (p.days || []).map(d => ({
            day: d.day || 1,
            title: d.title || `Day ${d.day}`,
            exercises: (d.exercises || []).map(ex => ({
              id: ex.id || ex._id || `ex_${Math.random()}`,
              title: ex.title,
              type: ex.type || 'reps',
              time: ex.time || 30,
              reps: ex.reps || 12,
              sets: ex.sets || 3,
              thumbnail: ex.thumbnail || '/trainer-3.jpg',
              description: ex.description || ex.notes || '',
              section: ex.section || 'Workout'
            }))
          }))
        }));
        setPrograms(transformed);
        if (transformed.length > 0) {
          setSelectedProgramId(transformed[0].id);
        }
      } catch (err) {
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPrograms();
  }, []);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const res = await axios.get(`${API_BASE}/programs/achievements`, { withCredentials: true });
        setAchievements(res.data.unlocked || []);
      } catch (err) {
        console.error("Failed to load achievements:", err);
        setAchievements([]);
      }
    };

    loadAchievements();
  }, []);
  useEffect(() => {
    if (!selectedProgramId) return;

    const loadData = async () => {
      try {
        const [progressRes, streakRes, weeklyRes] = await Promise.all([
          axios.get(`${API_BASE}/programs/${selectedProgramId}/progress`, { withCredentials: true }),
          axios.get(`${API_BASE}/programs/${selectedProgramId}/streak`, { withCredentials: true }),
          axios.get(`${API_BASE}/stats/weekly`, { withCredentials: true }).catch(() => ({ data: { last7Days: [] } }))
        ]);

        setCompletedExercises(progressRes.data.completedExercises || []);
        setStreak(streakRes.data.streak || 0);
        setWeeklyProgress(weeklyRes.data.last7Days || []);
      } catch (err) {
        console.error("Failed to load progress data", err);
      }
    };

    loadData();
  }, [selectedProgramId]);

  // Timer logic
  useEffect(() => {
    const ex = exercises[currentIndex];
    setSecondsLeft(getSecondsForExercise(ex));
    setRunning(false);
  }, [currentIndex, selectedDayIndex, exercises]);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          finishExercise(true); // auto-complete on timer end
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  function getSecondsForExercise(ex) {
    if (!ex) return 30;
    if (ex.type === 'time') return ex.time || 30;
    if (ex.type === 'reps') return (ex.reps || 12) * 2;
    return 30;
  }

  function togglePlay() {
    if (!exercises[currentIndex]) return;
    setRunning(prev => !prev);
  }

  async function finishExercise(auto = false) {
    const ex = exercises[currentIndex];
    if (!ex || completedExercises.includes(ex.id)) return;

    setRunning(false);

    try {
      const res = await axios.post(
        `${API_BASE}/programs/${currentProgram.id}/complete-exercise`,
        { day: currentDay.day, exerciseId: ex.id },
        { withCredentials: true }
      );

      if (res.data.success && !res.data.alreadyCompleted) {
        setCompletedExercises(prev => Array.from(new Set([...prev, ex.id])));

        // Add estimated minutes for this exercise only
        let timeSpentSeconds = ex.type === 'time' ? ex.time : (ex.reps || 12) * (ex.sets || 3) * 3;
        const minutes = Math.round(timeSpentSeconds / 60);
        await axios.post(`${API_BASE}/stats/workout-minutes`, { minutes }, { withCredentials: true })
          .then(r => setBackendWorkoutMinutes(r.data.workoutMinutes || 0))
          .catch(() => { });

        // Check if entire day is now completed
        const allCompleted = currentDay.exercises.every(e => completedExercises.includes(e.id) || e.id === ex.id);
        if (allCompleted) {
          confetti({
            particleCount: 500,
            spread: 130,
            origin: { y: 0.58 },
            colors: ['#e3002a', '#ff4757', '#ffa502', '#ffdd59', '#2ed573', '#1e90ff', '#ff9ff3'],
            scalar: 1.3,
            ticks: 250,
          });
          setShowCompletePopup(true); // Only show popup, final save happens there
        }
      }
    } catch (err) {
      console.error("Failed to complete exercise", err);
      alert("Could not save progress. Check your connection.");
    }

    // Auto-advance
    const nextUnfinished = exercises.findIndex((e, i) => i > currentIndex && !completedExercises.includes(e.id));
    if (nextUnfinished !== -1) {
      setCurrentIndex(nextUnfinished);
      setTimeout(() => {
        document.getElementById(`exercise-${exercises[nextUnfinished].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    } else if (selectedDayIndex < days.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
      setCurrentIndex(0);
    }
  }

  function prevExercise() {
    setRunning(false);
    setCurrentIndex(i => Math.max(0, i - 1));
  }

  function skipExercise() {
    setRunning(false);
    const next = currentIndex + 1;
    if (next < exercises.length) {
      setCurrentIndex(next);
    } else if (selectedDayIndex < days.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
      setCurrentIndex(0);
    }
    // Skip does NOT mark as complete → no minutes added
  }

  async function repeatDay() {
    try {
      await axios.post(
        `${API_BASE}/programs/${currentProgram.id}/reset-day`,
        { day: currentDay.day },
        { withCredentials: true }
      );
      setCompletedExercises(prev => prev.filter(id => !currentDay.exercises.map(e => e.id).includes(id)));
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to reset day", err);
      if (confirm("Server reset failed. Reset locally?")) {
        setCompletedExercises(prev => prev.filter(id => !currentDay.exercises.map(e => e.id).includes(id)));
        setCurrentIndex(0);
      }
    }
  }

  async function restartProgram() {
    try {
      await axios.post(
        `${API_BASE}/programs/${currentProgram.id}/reset-program`,
        {},
        { withCredentials: true }
      );
      setCompletedExercises([]);
      setSelectedDayIndex(0);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to restart program", err);
      if (confirm("Server reset failed. Reset locally anyway?")) {
        setCompletedExercises([]);
        setSelectedDayIndex(0);
        setCurrentIndex(0);
      }
    }
  }

  const displayExercises = exercises.filter(
    ex => (filter === 'All' || ex.section === filter) && ex.title.toLowerCase().includes(query.toLowerCase())
  );

  const isRestDay = displayExercises.length === 0;
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  function toggleReminder() {
    setReminderEnabled(v => !v);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workouts...</p>
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">My Workouts</h1>
            <p className="text-sm text-gray-500 mt-1">Premium, focused workout hub — track programs and progress.</p>

            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Trophy size={16} color={THEME} />
                <span>Streak: <strong>{streak}</strong> days</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} color={THEME} />
                <span>Today: <strong>{backendWorkoutMinutes}</strong>min</span>
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
              <span className="text-sm">Achievements</span>
            </IconButton>

            <IconButton onClick={toggleReminder} className={`flex items-center gap-2 bg-white border border-gray-100 shadow-sm ${reminderEnabled ? '' : 'opacity-60'}`}>
              <Bell size={16} color={reminderEnabled ? THEME : '#999'} />
            </IconButton>

            <IconButton onClick={repeatDay} disabled={!currentProgram.id} className={`flex items-center gap-2 bg-white border border-gray-100 shadow-sm ${!currentProgram.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Repeat size={16} color={THEME} />
            </IconButton>

            <IconButton onClick={restartProgram} disabled={!currentProgram.id} className={`flex items-center gap-2 bg-white border border-gray-100 shadow-sm ${!currentProgram.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <RefreshCw size={16} color={THEME} />
            </IconButton>
          </div>
        </div>

        {/* Program Cards */}
        {programs.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 pb-3">
            <div className="text-center py-12 bg-white rounded-2xl p-8 border border-gray-100">
              <CheckCircle size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Programs Yet!</h2>
              <p className="text-gray-500">Your trainer will assign programs soon</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-3">
            {programs.map((p) => (
              <ProgramCard
                key={p.id}
                program={p}
                active={p.id === selectedProgramId}
                onClick={() => {
                  setSelectedProgramId(p.id);
                  setSelectedDayIndex(0);
                  setCurrentIndex(0);
                  setQuery('');
                }}
              />
            ))}
          </div>
        )}

        {/* Program Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_18px_40px_rgba(14,20,30,0.06)] border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900">{currentProgram.title}</h2>
              <p className="text-gray-600 mt-2">{currentProgram.description}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg flex items-center gap-2 border border-gray-100 shadow-sm"><Clock size={16} color={THEME} /> {currentProgram.duration}</div>
                <div className="p-3 rounded-lg flex items-center gap-2 border border-gray-100 shadow-sm"><Zap size={16} color={THEME} /> {currentProgram.calories}</div>
                <div className="p-3 rounded-lg flex items-center gap-2 border border-gray-100 shadow-sm"><Calendar size={16} color={THEME} /> {currentProgram.totalDays} days</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentProgram.equipment?.length > 0 ? (
                  currentProgram.equipment.map((eq, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-gray-50 text-sm text-gray-600 shadow-sm">{eq}</span>
                  ))
                ) : (
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-500">No equipment needed</span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-full">
                <Progress percent={progressPercentage} status="active" strokeColor={THEME} />
                <div className="text-sm text-gray-500 mt-2">
                  {completedInCurrentProgram} / {totalExercisesInCurrentProgram} exercises completed
                </div>
              </div>
              <button onClick={() => setShowProgress(true)} className="w-full py-2 rounded-lg bg-red-600 text-white font-medium" style={{ background: THEME }}>
                View detailed progress
              </button>
            </div>
          </div>
        </div>

        {/* Day Selector */}
        {days.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-gray-500">Select a program above to view workout days</p>
          </div>
        ) : (
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
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : status === 'in-progress'
                      ? 'bg-orange-100 text-orange-800 border-orange-300'
                      : 'bg-white text-gray-700 border-gray-300';

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
            {['All', 'Warm-up', 'Workout', 'Cool-down'].map((s) => (
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
          <main ref={exerciseListRef} className="md:col-span-5 bg-white rounded-2xl p-6 shadow-sm max-h-[640px] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Day {currentDay.day} • {currentDay.title}</h3>
              <div className="text-sm text-gray-500">{displayExercises.length} exercises</div>
            </div>
            <div className="space-y-3">
              {displayExercises.length === 0 && (
                <div className="py-8 text-center text-gray-500">No exercises — enjoy your rest day!</div>
              )}
              {displayExercises.map((ex, idx) => (
                <motion.div
                  layout
                  id={`exercise-${ex.id}`}
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
                  <div className="text-xs text-gray-400">{ex.section}</div>
                </motion.div>
              ))}
            </div>
          </main>

          <aside className="md:col-span-7 bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-6 border border-gray-100">
            <div className="text-center">
              <div className="text-sm text-gray-500">Current Exercise</div>
              <div className="text-5xl font-bold text-red-600 mt-2" style={{ color: THEME }}>
                {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
              <div className="text-xl font-semibold text-gray-800 mt-2">{exercises[currentIndex]?.title || 'Select an exercise'}</div>
              <div className="text-sm text-gray-500 mt-1">{exercises[currentIndex]?.description}</div>
            </div>

            {isRestDay ? (
              <div className="rounded-2xl bg-gray-50 h-80 md:h-96 flex items-center justify-center flex-col shadow-inner">
                <h2 className="text-2xl font-bold text-gray-700">Rest Day</h2>
                <p className="text-gray-500 mt-2 text-center">No exercises today — relax and recover!</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-gray-50 h-80 md:h-96 flex items-center justify-center overflow-hidden shadow-inner">
                <img
                  src={exercises[currentIndex]?.thumbnail || '/trainer-3.jpg'}
                  alt="Exercise preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {!isRestDay && (
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
                    onClick={() => finishExercise(false)}
                    disabled={!exercises[currentIndex] || completedExercises.includes(exercises[currentIndex]?.id)}
                    className={`py-3 rounded-full font-medium transition-all ${!exercises[currentIndex] || completedExercises.includes(exercises[currentIndex]?.id)
                      ? 'bg-gray-300 text-white cursor-not-allowed'
                      : 'bg-red-600 text-white hover:opacity-90 shadow-md'
                      }`}
                    style={{
                      background: !exercises[currentIndex] || completedExercises.includes(exercises[currentIndex]?.id)
                        ? '#fe758eff'
                        : THEME
                    }}
                  >
                    {completedExercises.includes(exercises[currentIndex]?.id)
                      ? 'Completed ✓'
                      : 'Mark Complete'
                    }
                  </button>
                  <button onClick={skipExercise} className="py-3 rounded-full bg-yellow-500 text-white font-medium">
                    Skip
                  </button>
                </div>

                <div className="flex gap-3">
                  <button onClick={prevExercise} className="flex-1 py-3 bg-white border border-gray-200 rounded-full">
                    Previous
                  </button>

                  <button
                    onClick={() => {
                      let nd = selectedDayIndex + 1;
                      if (nd >= days.length) nd = selectedDayIndex;
                      setSelectedDayIndex(nd);
                      setCurrentIndex(0);
                    }}
                    className="flex-1 py-3 bg-white border border-gray-200 rounded-full"
                  >
                    Next Day
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

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
              className="bg-white rounded-2xl w-full max-w-md p-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">Progress Overview</h3>
                <button onClick={() => setShowProgress(false)} className="text-gray-500 p-2">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col items-center mt-6">
                <Progress type="circle" percent={progressPercentage} width={120} strokeColor={THEME} />
                <div className="text-gray-600 mt-3 text-lg">
                  {progressPercentage}% completed ({completedInCurrentProgram} / {totalExercisesInCurrentProgram})
                </div>
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
                <div className="flex gap-2 justify-center">
                  {weeklyProgress.length > 0 ? weeklyProgress.map((w) => (
                    <div key={w.day} className="flex flex-col items-center text-xs">
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100">
                        {w.count}
                      </div>
                      <div className="mt-1 text-gray-400">{new Date(w.day).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-sm">No data yet</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm text-gray-600">Daily reminder:</label>
                <div className="flex items-center gap-2 mt-2">
                  <input type="time" value={reminderHour} onChange={(e) => setReminderHour(e.target.value)} className="px-2 py-1 border rounded" />
                  <button onClick={toggleReminder} className={`px-3 py-1 rounded ${reminderEnabled ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                    {reminderEnabled ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day Complete Popup */}
      <AnimatePresence>
        {showCompletePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-7 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: "#e3002a" }} />

              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                Day {currentDay.day} Completed! 🎉
              </h2>

              <p className="text-gray-600 mt-1 mb-6">
                Amazing session! Help us track your progress better (both optional).
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 135 (optional)"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl text-center text-lg shadow-sm focus:border-[#e3002a] focus:ring-2 focus:ring-[#e3002a]/40 outline-none transition"
                  min="30"
                  max="250"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 69.5 (optional)"
                  value={weightInput || ""}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl text-center text-lg shadow-sm focus:border-[#e3002a] focus:ring-2 focus:ring-[#e3002a]/40 outline-none transition"
                  min="30"
                  max="200"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setHeartRate("");
                    setWeightInput("");
                    setShowCompletePopup(false);
                  }}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Skip
                </button>

                <button
                  onClick={async () => {
                    const hr = heartRate.trim() === "" ? null : Number(heartRate);
                    const wt = weightInput.trim() === "" ? null : Number(weightInput);

                    if (hr !== null && (hr < 30 || hr > 250)) {
                      alert("Heart rate should be between 30-250 BPM");
                      return;
                    }
                    if (wt !== null && (wt < 30 || wt > 200)) {
                      alert("Weight should be between 30-200 kg");
                      return;
                    }

                    const totalSeconds = calculateDayWorkoutSeconds();
                    const workoutMinutes = Math.round(totalSeconds / 60);

                    try {
                      await axios.post(
                        `${API_BASE}/programs/${currentProgram.id}/complete-day`,
                        {
                          day: currentDay.day,
                          workoutMinutes,
                          heartRate: hr,
                          weight: wt,
                        },
                        { withCredentials: true }
                      );

                      if (response.data.streak !== undefined) {
                        setStreak(response.data.streak);
                      }

                    } catch (error) {
                      console.error("Failed to save day completion:", error);
                    } finally {
                      setHeartRate("");
                      setWeightInput("");
                      setShowCompletePopup(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl text-white font-semibold shadow-md transition hover:opacity-90"
                  style={{ backgroundColor: "#e3002a" }}
                >
                  Save & Continue
                </button>
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
              className="bg-white rounded-2xl w-full max-w-md p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">Achievements</h3>
                <button onClick={() => setShowAchievements(false)} className="text-gray-500 p-2">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                {Object.entries(achievementDefs).map(([key, def]) => {
                  const unlocked = achievements.includes(key);
                  return (
                    <div key={key} className={`p-3 rounded-lg border ${unlocked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{def.title}</div>
                          <div className="text-xs text-gray-500">{def.desc}</div>
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
    </div>
  );
}