import React, { useState, useMemo, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  format,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronLeft, ChevronRight, Trash2, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useUserAuth } from "../../context/AuthContext";

const THEME_COLOR = "#e3002a";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/schedule`,
  withCredentials: true,
});


export const getMemberSchedule = async (month) => (await API.get(`?month=${month}`)).data.events;
export const createEvent = async (data) => (await API.post("/", data)).data.event;
export const updateEvent = async (id, data) => (await API.put(`/${id}`, data)).data.event;
export const deleteEvent = async (id) => (await API.delete(`/${id}`)).data;
export const markCompleteEvent = async (id) => (await API.patch(`/${id}/complete`)).data.event;

export default function ProfessionalSchedule() {
  const { user, loading } = useUserAuth(); 

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    completed: false,
    source: "manual",
  });

  // Fetch events when month changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (loading || !user) return;
      try {
        const monthStr = format(currentMonth, "yyyy-MM");
        const data = await getMemberSchedule(monthStr);
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, [currentMonth, user, loading]);

  // Reset form when modal closes
  useEffect(() => {
    if (!modalOpen) {
      setNewEvent({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        completed: false,
        source: "manual",
      });
    }
  }, [modalOpen]);

  const openModal = (date, event = null) => {
    setSelectedDate(date);
    setSelectedEvent(event);
    setNewEvent(
      event
        ? { ...event }
        : {
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          completed: false,
          source: "manual",
        }
    );
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSave = async () => {
    if (!newEvent.title.trim() || !newEvent.startTime) {
      alert("Please fill Title and Start Time.");
      return;
    }

    if (!user?.id) {
      alert("User session not loaded. Please refresh or login again.");
      console.error("User object missing _id:", user);
      return;
    }

    try {
      if (selectedEvent) {
        if (selectedEvent.source !== "manual") {
          alert("Admin-scheduled events cannot be edited.");
          return;
        }

        const updated = await updateEvent(selectedEvent._id, {
          ...newEvent,
          date: format(selectedDate, "yyyy-MM-dd"),
        });

        setEvents(prev => prev.map(ev => ev._id === updated._id ? updated : ev));
      } else {
        const payload = {
          title: newEvent.title.trim(),
          description: newEvent.description || "",
          startTime: newEvent.startTime,
          endTime: newEvent.endTime || null,
          date: format(selectedDate, "yyyy-MM-dd"),
          userId: user.id,
          source: "manual",
          completed: false,
        };

        console.log("Sending payload:", payload); // ← debug के लिए

        const created = await createEvent(payload);
        setEvents(prev => [...prev, created]);
      }

      closeModal();
    } catch (err) {
      console.error("Save event error:", err.response?.data || err);
      alert("Failed to save workout. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    const ev = events.find((e) => e._id === id);
    if (ev?.source !== "manual") {
      alert("Only manual workouts can be deleted.");
      return;
    }

    if (window.confirm("Delete this workout?")) {
      try {
        await deleteEvent(id);
        setEvents((prev) => prev.filter((ev) => ev._id !== id));
        closeModal();
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete workout.");
      }
    }
  };

  const markComplete = async (id) => {
    try {
      const updated = await markCompleteEvent(id);
      setEvents((prev) =>
        prev.map((ev) => (ev._id === updated._id ? updated : ev))
      );
    } catch (err) {
      console.error("Mark complete error:", err);
    }
  };

  // Calendar logic remains same
  const startDate = startOfWeek(startOfMonth(currentMonth));
  const endDate = endOfWeek(endOfMonth(currentMonth));

  const daysMatrix = useMemo(() => {
    const rows = [];
    let day = startDate;
    while (day <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(day));
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [startDate, endDate]);

  const eventsByDate = useMemo(() => {
    return events.reduce((acc, ev) => {
      acc[ev.date] = acc[ev.date] || [];
      acc[ev.date].push(ev);
      return acc;
    }, {});
  }, [events]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading schedule...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Please login to view your schedule.</div>;
  }

  return (
    <div className="min-h-screen bg-white rounded-lg p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">My Schedules</h1>
        <p className="text-sm text-gray-500">Welcome back, {user.name || "Member"}!</p>
      </div>

      {/* Calendar */}
      <div className="max-w-7xl mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-6">
        {/* Navigation & Add Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100 transition">
              <ChevronLeft size={20} color={THEME_COLOR} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{format(currentMonth, "MMMM yyyy")}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-gray-100 transition">
              <ChevronRight size={20} color={THEME_COLOR} />
            </button>
          </div>

          <button
            onClick={() => openModal(new Date())}
            className="flex items-center gap-2 bg-[#e3002a] text-white px-4 py-2 rounded-xl hover:brightness-95 transition"
          >
            <Plus size={16} /> Add Workout
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 text-center text-gray-500 font-semibold text-sm mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid gap-3">
          {daysMatrix.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-3">
              {week.map((day) => {
                const dayKey = format(day, "yyyy-MM-dd");
                const dayEvents = (eventsByDate[dayKey] || []).sort((a, b) =>
                  (a.startTime || "").localeCompare(b.startTime || "")
                );

                return (
                  <motion.div
                    key={dayKey}
                    className={`flex flex-col rounded-2xl p-3 min-h-[150px] cursor-pointer transition-all duration-200 border
                      ${isSameMonth(day, currentMonth) ? "bg-white" : "bg-gray-100 opacity-60"}
                      ${isToday(day) ? "ring-2 ring-[#e3002a]" : "border-transparent"}
                      shadow-sm hover:shadow-lg`}
                    whileHover={{ y: -2 }}
                    onClick={() => openModal(day)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`font-semibold text-md ${isToday(day) ? "text-[#e3002a]" : "text-gray-800"}`}>
                        {format(day, "d")}
                      </div>
                      <div className="text-xs text-gray-500">{dayEvents.length}</div>
                    </div>

                    <div className="flex flex-col gap-1 overflow-hidden flex-1">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div
                          key={ev._id}
                          onClick={(e) => { e.stopPropagation(); openModal(day, ev); }}
                          className={`flex items-center justify-between rounded-xl px-2 py-1 text-xs cursor-pointer
                            ${ev.completed ? "bg-green-50 border border-green-200" : ev.source === "manual" ? "bg-white border border-gray-200" : "bg-gray-50 border border-gray-300"}
                            shadow-sm hover:shadow-md transition`}
                        >
                          <div className="flex flex-col truncate">
                            <div className="font-medium truncate">{ev.title}</div>
                            <div className="text-[10px] text-gray-600">
                              {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ""}
                            </div>
                            <div className="mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${ev.source === "program" ? "bg-blue-100 text-blue-800" :
                                  ev.source === "challenge" ? "bg-purple-100 text-purple-800" :
                                    ev.source === "class" ? "bg-yellow-100 text-yellow-800" :
                                      "bg-gray-100 text-gray-800"
                                }`}>
                                {ev.source === "program" ? "Program" : ev.source === "challenge" ? "Challenge" : ev.source === "class" ? "Class" : "Manual"}
                              </span>
                            </div>
                          </div>
                          {ev.completed && <CheckCircle2 size={14} className="text-green-600" />}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[11px] text-center text-gray-500 mt-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                      {dayEvents.length === 0 && (
                        <div className="text-[11px] text-gray-300 text-center mt-2">No workouts</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/25 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-6 max-h-[95vh] overflow-y-auto"
              initial={{ y: 20, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">
                  {selectedEvent
                    ? selectedEvent.source !== "manual"
                      ? "Admin Scheduled Workout"
                      : "Edit Workout"
                    : `Add Workout — ${format(selectedDate, "EEE, dd MMM")}`}
                </h4>
                <div className="flex items-center gap-2">
                  {selectedEvent && selectedEvent.source === "manual" && (
                    <button onClick={() => handleDelete(selectedEvent._id)} className="text-red-600 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-700">Title *</label>
                  <input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent((s) => ({ ...s, title: e.target.value }))}
                    disabled={selectedEvent && selectedEvent.source !== "manual"}
                    placeholder="e.g., Evening Run"
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${selectedEvent && selectedEvent.source !== "manual" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">Start Time *</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent((s) => ({ ...s, startTime: e.target.value }))}
                    disabled={selectedEvent && selectedEvent.source !== "manual"}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${selectedEvent && selectedEvent.source !== "manual" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent((s) => ({ ...s, endTime: e.target.value }))}
                    disabled={selectedEvent && selectedEvent.source !== "manual"}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${selectedEvent && selectedEvent.source !== "manual" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-700">Notes</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent((s) => ({ ...s, description: e.target.value }))}
                    disabled={selectedEvent && selectedEvent.source !== "manual"}
                    rows={3}
                    placeholder="Any additional notes..."
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none ${selectedEvent && selectedEvent.source !== "manual" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>

                {/* Hidden: User info (since member only adds for themselves) */}
                <div className="md:col-span-2 text-xs text-gray-500">
                  Workout for: <span className="font-medium">{user.name || "You"}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                  Cancel
                </button>

                {(!selectedEvent || selectedEvent.source === "manual") && (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg bg-[#e3002a] text-white hover:brightness-95 transition"
                  >
                    {selectedEvent ? "Update" : "Create"} Workout
                  </button>
                )}

                {selectedEvent && !selectedEvent.completed && selectedEvent.source === "manual" && (
                  <button
                    onClick={async () => {
                      await markComplete(selectedEvent._id);
                      closeModal();
                    }}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:brightness-90 transition"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}