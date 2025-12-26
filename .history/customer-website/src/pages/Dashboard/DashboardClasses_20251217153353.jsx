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
          src={program.thumbnail || '/Personal-Trainig.jpg'}
          alt={program.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute left-4 bottom-4 text-white">
          <div className="text-xs tracking-wide opacity-90">
            {program.subtitle || `${program.level} • ${program.duration}`}
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
            {program.calories || '350-500 Kal'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Backend से आने वाला progress
  const [progressData, setProgressData] = useState({
    completedExercises: [],
    streak: 0,
    achievements: [],
  });

  // Reminder (localStorage में रखा है – harmless)
  const [reminderEnabled, setReminderEnabled] = useState(() => JSON.parse(localStorage.getItem('classReminderEnabled') || 'false'));
  const [reminderHour, setReminderHour] = useState(() => localStorage.getItem('classReminderHour') || '18:00');

  const timerRef = useRef(null);
  const reminderIntervalRef = useRef(null);

  // Current program
  const currentProgram = classes.find(p => p.id === selectedProgramId) || {
    id: null,
    title: 'Select a Class',
    description: 'Click any class card to begin',
    duration: '45 min',
    calories: '400 Kal',
    level: 'All Levels',
    equipment: [],
    totalDays: 0,
    days: []
  };
  const days = currentProgram.days || [];
  const currentDay = days[selectedDayIndex] || { day: 1, title: 'Rest Day', exercises: [] };
  const exercises = currentDay.exercises || [];

  const totalExercisesInCurrent = currentProgram.days?.reduce((acc, d) => acc + (d.exercises?.length || 0), 0) || 0;
  const completedInCurrent = currentProgram.days?.reduce((acc, d) =>
    acc + d.exercises.filter(ex => progressData.completedExercises.includes(ex.id)).length, 0) || 0;
  const progressPercentage = totalExercisesInCurrent === 0 ? 0 : Math.round((completedInCurrent / totalExercisesInCurrent) * 100);

  // Load classes + first class progress
  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/classes/user`, { withCredentials: true });
        const transformed = (res.data.classes || []).map(cls => ({
          id: cls._id,
          title: cls.title || 'Untitled Class',
          subtitle: cls.subtitle || `${cls.level || 'All Levels'} • ${cls.duration || '45 min'}`,
          description: cls.description || '',
          duration: cls.duration || '45 min',
          calories: cls.caloriesBurned || '400 Kal',
          level: cls.level || 'All Levels',
          thumbnail: cls.thumbnail || '/Personal-Trainig.jpg',
          equipment: cls.equipment || [],
          totalDays: cls.days?.length || 7,
          days: (cls.days || []).map((day, i) => ({
            day: i + 1,
            title: day.title || `Day ${i + 1}`,
            exercises: (day.exercises || []).map(ex => ({
              id: ex._id.toString(),
              section: ex.section || 'Workout',
              title: ex.title || 'Exercise',
              type: ex.type || 'reps',
              time: ex.time || 30,
              reps: ex.reps || 12,
              sets: ex.sets || 3,
              thumbnail: ex.thumbnail || '/trainer-3.jpg',
              description: ex.description || ex.notes || ''
            }))
          }))
        }));

        setClasses(transformed);

        if (transformed.length > 0) {
          const firstClass = transformed[0];
          setSelectedProgramId(firstClass.id);
          await loadProgress(firstClass.id);
        }
      } catch (err) {
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    const loadProgress = async (classId) => {
      try {
        const res = await axios.get(`${API_BASE}/classes/${classId}/progress`, { withCredentials: true });
        setProgressData(res.data.progress || { completedExercises: [], streak: 0, achievements: [] });
      } catch (err) {
        console.error('Failed to load progress', err);
        setProgressData({ completedExercises: [], streak: 0, achievements: [] });
      }
    };

    loadClasses();
  }, []);

  // Timer reset
  useEffect(() => {
    const ex = exercises[currentIndex];
    setSecondsLeft(getSecondsForExercise(ex));
    setRunning(false);
  }, [currentIndex, selectedDayIndex, selectedProgramId]);

  // Timer logic
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

  // Reminder system
  useEffect(() => {
    if (reminderIntervalRef.current) clearInterval(reminderIntervalRef.current);
    if (reminderEnabled) {
      reminderIntervalRef.current = setInterval(() => {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (time === reminderHour) {
          if (window.Notification && Notification.permission === 'granted') {
            new Notification('Class Reminder', { body: "It's time for your workout class!" });
          } else {
            alert("It's time for your workout class!");
          }
        }
      }, 60000);
    }
    return () => clearInterval(reminderIntervalRef.current);
  }, [reminderEnabled, reminderHour]);

  function getSecondsForExercise(ex) {
    if (!ex) return 30;
    return ex.type === 'time' ? (ex.time || 30) : (ex.reps || 12) * 2;
  }

  function togglePlay() {
    if (!exercises[currentIndex]) return;
    setRunning(prev => !prev);
  }

  function finishExercise(manual = false) {
    const ex = exercises[currentIndex];
    if (!ex || !selectedProgramId) return;

    const newCompleted = Array.from(new Set([...progressData.completedExercises, ex.id]));
    setProgressData(prev => ({ ...prev, completedExercises: newCompleted }));

    axios.post(`${API_BASE}/classes/progress`, {
      classId: selectedProgramId,
      completedExerciseId: ex.id,
    }, { withCredentials: true })
      .then(res => {
        setProgressData(res.data.progress);
      })
      .catch(err => {
        console.error('Progress save failed', err);
      });

    // Confetti
    const completedBeforeThis = currentDay.exercises.filter(e => progressData.completedExercises.includes(e.id)).length;
    const willBeCompletedAfterThis = completedBeforeThis + 1;

    if (willBeCompletedAfterThis === currentDay.exercises.length &&
      completedBeforeThis < currentDay.exercises.length &&
      currentDay.exercises.length > 0) {
      confetti({
        particleCount: 500,
        spread: 130,
        origin: { y: 0.58 },
        colors: ['#e3002a', '#ff4757', '#ffa502', '#ffdd59', '#2ed573', '#1e90ff', '#ff9ff3'],
        scalar: 1.3,
        ticks: 250
      });
    }

    setRunning(false);

    // Auto-advance
    const nextIdx = exercises.findIndex((e, i) => i > currentIndex && !newCompleted.includes(e.id));
    if (nextIdx !== -1) {
      setCurrentIndex(nextIdx);
      setTimeout(() => document.getElementById(`exercise-${exercises[nextIdx].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
    } else {
      let nextDay = selectedDayIndex + 1;
      while (nextDay < days.length && days[nextDay]?.exercises?.length === 0) nextDay++;
      if (nextDay < days.length) {
        setSelectedDayIndex(nextDay);
        setCurrentIndex(0);
      }
    }
  }

  function repeatDay() {
    const dayIds = currentDay.exercises.map(e => e.id);
    const filtered = progressData.completedExercises.filter(id => !dayIds.includes(id));

    setProgressData(prev => ({ ...prev, completedExercises: filtered }));

    axios.post(`${API_BASE}/classes/progress`, {
      classId: selectedProgramId,
      completedExercises: filtered,
    }, { withCredentials: true });

    setCurrentIndex(0);
  }

  function restartProgram() {
    setProgressData(prev => ({ ...prev, completedExercises: [] }));

    axios.post(`${API_BASE}/classes/progress`, {
      classId: selectedProgramId,
      completedExercises: [],
    }, { withCredentials: true });

    setSelectedDayIndex(0);
    setCurrentIndex(0);
  }

  const displayExercises = exercises.filter(ex =>
    (filter === 'All' || ex.section === filter) &&
    ex.title.toLowerCase().includes(query.toLowerCase())
  );

  const isRestDay = exercises.length === 0;
  const minutes = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const achievementDefs = {
    first_ex: { title: 'First Exercise', desc: 'Completed your first exercise' },
    ten_ex: { title: '10 Exercises', desc: 'Completed 10 exercises' },
    seven_day_streak: { title: '7 Day Streak', desc: 'Worked out 7 days in a row' }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your classes...</p>
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">My Classes</h1>
            <p className="text-sm text-gray-500 mt-1">Premium, focused class experience — track progress, streaks & more.</p>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Trophy size={16} color={THEME} />
                <span>Streak: <strong>{progressData.streak}</strong> days</span>
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

            <IconButton onClick={() => {
              const v = !reminderEnabled;
              setReminderEnabled(v);
              localStorage.setItem('classReminderEnabled', JSON.stringify(v));
              if (v && Notification.permission !== 'granted') Notification.requestPermission();
            }}
              className={`flex items-center gap-2 bg-white border border-gray-100 shadow-sm ${reminderEnabled ? '' : 'opacity-60'}`}
              title="Toggle reminder">
              <Bell size={16} color={reminderEnabled ? THEME : '#999'} />
            </IconButton>
            <IconButton onClick={repeatDay} title="Repeat current day">
              <Repeat size={16} color={THEME} />
            </IconButton>
            <IconButton onClick={restartProgram} title="Restart program">
              <RefreshCw size={16} color={THEME} />
            </IconButton>
          </div>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-xl text-gray-500">No classes assigned yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-3">
            {classes.map(p => (
              <ProgramCard
                key={p.id}
                program={p}
                active={p.id === selectedProgramId}
                onClick={async () => {
                  setSelectedProgramId(p.id);
                  setSelectedDayIndex(0);
                  setCurrentIndex(0);
                  setQuery('');
                  setFilter('All');

                  try {
                    const res = await axios.get(`${API_BASE}/classes/${p.id}/progress`, { withCredentials: true });
                    setProgressData(res.data.progress || { completedExercises: [], streak: 0, achievements: [] });
                  } catch (err) {
                    setProgressData({ completedExercises: [], streak: 0, achievements: [] });
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Class Overview */}
        {selectedProgramId && (
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
                  {currentProgram.equipment?.length > 0 ? currentProgram.equipment.map(eq => (
                    <span key={eq} className="px-3 py-1 rounded-full bg-gray-50 text-sm text-gray-600 shadow-sm">{eq}</span>
                  )) : (
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-500">No equipment needed</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <Progress percent={progressPercentage} status="active" strokeColor={THEME} />
                <div className="text-sm text-gray-500 mt-2">
                  {completedInCurrent} / {totalExercisesInCurrent} completed
                </div>
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
                <button key={idx} onClick={() => { setSelectedDayIndex(idx); setCurrentIndex(0); setQuery(''); }}
                  className={`px-4 py-2 rounded-full shadow-sm border ${bg}`}
                  style={selectedDayIndex === idx ? { background: THEME } : {}}>
                  Day {d.day}
                  {status === 'completed' && <CheckCircle size={14} className="inline ml-2" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-2">
            {['All', 'Warm-up', 'Workout', 'Cool-down'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full border ${filter === s ? 'text-white' : 'bg-white'}`}
                style={filter === s ? { background: THEME } : {}}>
                {s}
              </button>
            ))}
          </div>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search exercises..."
            className="px-4 py-2 rounded-full border border-gray-200 w-full md:w-80" />
        </div>

        {/* Main Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <main className="md:col-span-5 bg-white rounded-2xl p-6 shadow-sm max-h-[640px] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Day {currentDay.day} • {currentDay.title}</h3>
              <p className="mt-2 text-lg text-gray-600">
                ({completedInCurrent} / {totalExercisesInCurrent} exercises)
              </p>
            </div>
            <div className="space-y-3">
              {displayExercises.length === 0 ? (
                <div className="py-8 text-center text-gray-500">No exercises — enjoy your rest day!</div>
              ) : (
                displayExercises.map((ex) => (
                  <motion.div layout key={ex.id} id={`exercise-${ex.id}`}
                    onClick={() => setCurrentIndex(exercises.indexOf(ex))}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${exercises[currentIndex]?.id === ex.id ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm">
                        <img src={ex.thumbnail} alt={ex.title} className="w-full h-full object-cover" />
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
                    <div className="text-xs text-gray-400">{ex.section}</div>
                  </motion.div>
                ))
              )}
            </div>
          </main>

          <aside className="md:col-span-7 bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-6 border border-gray-100">
            <div className="text-center">
              <div className="text-sm text-gray-500">Current Exercise</div>
              <div className="text-5xl font-bold mt-2" style={{ color: THEME }}>
                {String(minutes).padStart(2, '0')}:{secs}
              </div>
              <div className="text-xl font-semibold text-gray-800 mt-2">
                {exercises[currentIndex]?.title || 'Select an exercise'}
              </div>
              <div className="text-sm text-gray-500 mt-1">{exercises[currentIndex]?.description}</div>
            </div>

            {isRestDay ? (
              <div className="rounded-2xl bg-gray-50 h-80 md:h-96 flex items-center justify-center flex-col shadow-inner">
                <h2 className="text-2xl font-bold text-gray-700">Rest Day</h2>
                <p className="text-gray-500 mt-2 text-center">No exercises today — relax and recover!</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-gray-50 h-80 md:h-96 flex items-center justify-center overflow-hidden shadow-inner">
                <img src={exercises[currentIndex]?.thumbnail || '/trainer-3.jpg'} alt="Exercise" className="w-full h-full object-cover" />
              </div>
            )}

            {!isRestDay && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={togglePlay}
                    className={`py-3 rounded-full flex items-center justify-center gap-2 font-medium ${running ? 'text-white' : 'bg-white border border-gray-200'}`}
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
                    style={{
                      background: progressData.completedExercises.includes(exercises[currentIndex]?.id) ? '#E' : THEME
                    }}
                  >
                    {progressData.completedExercises.includes(exercises[currentIndex]?.id) ? 'Completed' : 'Mark Complete'}
                  </button>
                  <button onClick={() => finishExercise(true)} className="py-3 rounded-full bg-yellow-500 text-white font-medium">
                    Skip
                  </button>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} className="flex-1 py-3 bg-white border border-gray-200 rounded-full">
                    Previous
                  </button>
                  <button onClick={() => {
                    let nd = selectedDayIndex + 1;
                    if (nd >= days.length) nd = selectedDayIndex;
                    setSelectedDayIndex(nd);
                    setCurrentIndex(0);
                  }} className="flex-1 py-3 bg-white border border-gray-200 rounded-full">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowProgress(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">Progress Overview</h3>
                <button onClick={() => setShowProgress(false)}><X size={24} /></button>
              </div>
              <div className="flex flex-col items-center">
                <Progress type="circle" percent={progressPercentage} width={120} strokeColor={THEME} />
                <p className="mt-4 text-2xl font-bold">{progressPercentage}% Complete</p>
              </div>
              <div className="mt-8 space-y-3">
                {days.map((d, i) => {
                  const done = d.exercises.filter(ex => progressData.completedExercises.includes(ex.id)).length;
                  const total = d.exercises.length;
                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span>Day {d.day} • {d.title}</span>
                      <span className={done === total ? 'text-green-600 font-medium' : 'text-gray-500'}>
                        {done === total ? 'Completed' : `${done}/${total}`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6">
                <label className="text-sm text-gray-600">Daily reminder:</label>
                <div className="flex items-center gap-2 mt-2">
                  <input type="time" value={reminderHour} onChange={e => { setReminderHour(e.target.value); localStorage.setItem('classReminderHour', e.target.value); }} className="px-2 py-1 border rounded" />
                  <button onClick={() => { const v = !reminderEnabled; setReminderEnabled(v); localStorage.setItem('classReminderEnabled', JSON.stringify(v)); }} className={`px-3 py-1 rounded ${reminderEnabled ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowAchievements(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">Achievements</h3>
                <button onClick={() => setShowAchievements(false)}><X size={24} /></button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(achievementDefs).map(([key, def]) => {
                  const unlocked = progressData.achievements.includes(key);
                  return (
                    <div key={key} className={`p-3 rounded-lg border ${unlocked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{def.title}</div>
                          <div className="text-xs text-gray-500">{def.desc}</div>
                        </div>
                        <div className="text-sm">{unlocked ? <span className="text-green-600 font-medium">Unlocked</span> : <span className="text-gray-400">Locked</span>}</div>
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
    </div>
  );
}