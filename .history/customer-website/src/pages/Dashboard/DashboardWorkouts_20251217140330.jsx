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

export default function MyWorkoutsProPremium() {
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
  const [lastWorkoutDate, setLastWorkoutDate] = useState(null);
  const [streak, setStreak] = useState(0);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState('18:00');
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [backendWorkoutMinutes, setBackendWorkoutMinutes] = useState(0);

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

  const achievementDefs = {
    first_ex: { title: 'First Exercise', desc: 'Completed your first exercise' },
    ten_ex: { title: '10 Exercises', desc: 'Completed 10 exercises' },
    seven_day_streak: { title: '7 Day Streak', desc: 'Worked out 7 days in a row' }
  };

  const [achievements, setAchievements] = useState([]);

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
              thumbnail: ex.thumbnail ? `http://localhost:5000${ex.thumbnail.startsWith('/') ? '' : '/'}${ex.thumbnail}` : '/trainer-3.jpg',
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

  // Load progress when program changes
  useEffect(() => {
    if (!selectedProgramId) return;
    const fetchProgress = async () => {
      try {
        const res = await axios.get(`${API_BASE}/programs/${selectedProgramId}/progress`, { withCredentials: true });
        setCompletedExercises(res.data.completedExercises || []);
      } catch (err) {
        console.error("Failed to load progress", err);
        setCompletedExercises([]);
      }
    };
    fetchProgress();
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
          finishExercise(true);
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

  async function finishExercise(manual = false) {
    const ex = exercises[currentIndex];
    if (!ex) return;

    try {
      const res = await axios.post(
        `${API_BASE}/programs/${currentProgram.id}/complete-exercise`,
        { day: currentDay.day, exerciseId: ex.id },
        { withCredentials: true }
      );

      if (res.data.success && !res.data.alreadyCompleted) {
        setCompletedExercises(prev => Array.from(new Set([...prev, ex.id])));

        // Sync workout minutes
        let timeSpentSeconds = ex.type === 'time' ? ex.time : (ex.reps || 12) * (ex.sets || 3) * 3;
        const minutes = Math.round(timeSpentSeconds / 60);
        await axios.post(`${API_BASE}/stats/workout-minutes`, { minutes }, { withCredentials: true })
          .then(r => setBackendWorkoutMinutes(r.data.workoutMinutes || 0))
          .catch(() => {});

        // Check if full day completed
        const dayExercises = currentDay.exercises || [];
        const allCompleted = dayExercises.every(e => completedExercises.includes(e.id) || e.id === ex.id);

        if (allCompleted) {
          handleExerciseComplete();
          confetti({
            particleCount: 500,
            spread: 130,
            origin: { y: 0.58 },
            colors: ['#e3002a', '#ff4757', '#ffa502', '#ffdd59', '#2ed573', '#1e90ff', '#ff9ff3'],
            scalar: 1.3,
            ticks: 250,
          });

          // Streak update - only on full day completion
          const todayStr = new Date().toDateString();
          if (lastWorkoutDate !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            let newStreak = 1;
            if (lastWorkoutDate === yesterdayStr) {
              newStreak = streak + 1;
            }

            setStreak(newStreak);
            setLastWorkoutDate(todayStr);
          }

          // Optional day complete API
          const totalSeconds = dayExercises.reduce((sum, e) => {
            return sum + (e.type === 'time' ? e.time : (e.reps || 12) * (e.sets || 3) * 3);
          }, 0);
          axios.post(`${API_BASE}/programs/${currentProgram.id}/complete-day`, {
            day: currentDay.day,
            workoutMinutes: Math.round(totalSeconds / 60)
          }, { withCredentials: true }).catch(() => {});
        }
      }
    } catch (err) {
      console.error("Failed to complete exercise", err);
      alert("Could not save progress. Check your connection.");
    }

    setRunning(false);

    // Auto advance
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

  // ← Yeh sab functions ab sahi jagah pe hain
  function prevExercise() {
    setRunning(false);
    setCurrentIndex(i => Math.max(0, i - 1));
  }

  function skipExercise() {
    finishExercise(true);
  }

  function repeatDay() {
    setCompletedExercises(prev => prev.filter(id => !currentDay.exercises.map(e => e.id).includes(id)));
    setCurrentIndex(0);
  }

  function restartProgram() {
    setCompletedExercises([]);
    setSelectedDayIndex(0);
    setCurrentIndex(0);
  }

  const displayExercises = exercises.filter(
    ex => (filter === 'All' || ex.section === filter) && ex.title.toLowerCase().includes(query.toLowerCase())
  );

  const isRestDay = displayExercises.length === 0;
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const handleExerciseComplete = () => setShowCompletePopup(true);

  function toggleReminder() {
    setReminderEnabled(v => !v);
  }

  function setReminder(hhmm) {
    setReminderHour(hhmm);
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
    // ... poora return same hai, koi change nahi ...
    // (space ke liye yahan cut kiya, lekin tumhare original return wala part bilkul same rahega)
    <div className="min-h-screen bg-white p-6 md:p-10 rounded-lg">
      {/* Sab UI same hai - header, cards, overview, day selector, filters, main grid, modals */}
      {/* Tumhara original return code yahan paste kar do */}
    </div>
  );
}