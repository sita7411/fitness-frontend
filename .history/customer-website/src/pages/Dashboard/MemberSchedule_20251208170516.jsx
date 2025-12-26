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

const THEME_COLOR = "#e3002a";

const API = axios.create({
  baseURL: "http://localhost:5000/api/schedule",
  withCredentials: true,
});

const getMemberSchedule = async (month) => (await API.get(`?month=${month}`)).data.events;
const createEvent = async (data) => (await API.post("/", data)).data.event;
const updateEvent = async (id, data) => (await API.put(`/${id}`, data)).data.event;
const deleteEvent = async (id) => (await API.delete(`/${id}`)).data;
const markCompleteEvent = async (id) => (await API.patch(`/${id}/complete`)).data.event;

const createEmptyEvent = () => ({
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  userName: "",
  completed: false,
  source: "manual",
});

export default function ProfessionalSchedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(createEmptyEvent());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const monthStr = format(currentMonth, "yyyy-MM");
        const data = await getMemberSchedule(monthStr);
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, [currentMonth]);

  useEffect(() => {
    if (!modalOpen) setNewEvent(createEmptyEvent());
  }, [modalOpen]);

  const startDate = startOfWeek(startOfMonth(currentMonth));
  const endDate = endOfWeek(endOfMonth(currentMonth));

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const openModal = (date, event = null) => {
    setSelectedDate(date);
    setSelectedEvent(event);
    setNewEvent(event ? { ...event } : createEmptyEvent());
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSave = async () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.userName) {
      alert("Please fill Title, Start Time & User.");
      return;
    }

    try {
      if (selectedEvent) {
        if (selectedEvent.source !== "manual") {
          alert("Admin-scheduled events cannot be edited.");
          return;
        }
        const updated = await updateEvent(selectedEvent._id, newEvent);
        setEvents((prev) =>
          prev.map((ev) => (ev._id === updated._id ? updated : ev))
        );
      } else {
        const created = await createEvent({
          ...newEvent,
          date: format(selectedDate, "yyyy-MM-dd"),
        });
        setEvents((prev) => [...prev, created]);
      }
      closeModal();
    } catch (err) {
      console.error("Save event error:", err);
    }
  };

  const handleDelete = async (id) => {
    const ev = events.find((e) => e._id === id);
    if (ev.source !== "manual") return;

    if (window.confirm("Delete this workout?")) {
      try {
        await deleteEvent(id);
        setEvents((prev) => prev.filter((ev) => ev._id !== id));
        closeModal();
      } catch (err) {
        console.error("Delete error:", err);
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

  return (
    <div className="min-h-screen bg-white rounded-lg p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">My Schedules</h1>
        <p className="text-sm text-gray-500">Manage all workouts and schedules</p>
      </div>

      {/* Calendar Container */}
<div className="max-w-7xl mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-6">

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
              <ChevronLeft size={20} color={THEME_COLOR} />
            </button>

            <h2 className="text-2xl font-bold text-gray-800">
              {format(currentMonth, "MMMM yyyy")}
            </h2>

            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
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

        {/* Weekday Headers */}
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
                const dayEvents = (eventsByDate[dayKey] || []).sort((a, b) => {
                  const t1 = a.startTime || "";
                  const t2 = b.startTime || "";
                  return t1.localeCompare(t2);
                });

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
                    {/* Date Number */}
                    <div className="flex justify-between items-start mb-2">
                      <div className={`font-semibold text-md ${isToday(day) ? "text-[#e3002a]" : "text-gray-800"}`}>
                        {format(day, "d")}
                      </div>
                      <div className="text-xs text-gray-500">{dayEvents.length}</div>
                    </div>

                    {/* Events */}
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
                            <div className="flex items-center gap-1 font-medium truncate">{ev.title}</div>
                            <div className="text-[10px] text-gray-600">
                              {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ""}
                            </div>
                            <div className="mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${ev.source === "program" ? "bg-blue-100 text-blue-800" : ev.source === "challenge" ? "bg-purple-100 text-purple-800" : ev.source === "class" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                                {ev.source === "program" ? "Program" : ev.source === "challenge" ? "Challenge" : ev.source === "class" ? "Class" : "Manual"}
                              </span>
                            </div>
                          </div>

                          {ev.completed && (
                            <CheckCircle2 size={14} className="text-green-600" />
                          )}
                        </div>
                      ))}

                      {dayEvents.length > 3 && (
                        <div className="text-[11px] text-center text-gray-500 mt-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}

                      {dayEvents.length === 0 && (
                        <div className="text-[11px] text-gray-300 pointer-events-none text-center mt-2">
                          No workouts
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL ================= */}
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
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">
                  {selectedEvent
                    ? selectedEvent.source !== "manual"
                      ? "Admin Scheduled"
                      : "Edit Workout"
                    : `New Workout — ${format(selectedDate, "EEE, dd MMM")}`}
                </h4>
                <div className="flex items-center gap-2">
                  {selectedEvent && selectedEvent.source === "manual" && (
                    <button
                      onClick={() => handleDelete(selectedEvent._id)}
                      className="text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-700">Title</label>
                  <input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent((s) => ({ ...s, title: e.target.value }))}
                    disabled={selectedEvent && selectedEvent.source !== "manual"}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${selectedEvent && selectedEvent.source !== "manual" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">User</label>
                  <input
                    value={newEvent.userName}
                    onChange={(e) => setNewEvent((s) => ({ ...s, userName: e.target.value }))}
                    disabled={selectedEvent && selectedEvent.source !== "manual"}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${selectedEvent && selectedEvent.source !== "manual" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">Start</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent((s) => ({ ...s, startTime: e.target.value }))}
                    disabled={selectedEvent && selectedEvent.source !== "manual"}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm ${selectedEvent && selectedEvent.source !== "manual" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">End</label>
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
                    className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm resize-none ${selectedEvent && selectedEvent.source !== "manual" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                {(!selectedEvent || selectedEvent.source === "manual") && (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg bg-[#e3002a] text-white hover:brightness-95 transition"
                  >
                    {selectedEvent ? "Update" : "Create"}
                  </button>
                )}

                {selectedEvent && !selectedEvent.completed && (
                  <button
                    onClick={async () => { await markComplete(selectedEvent._id); closeModal(); }}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:brightness-90 transition"
                  >
                    Mark as Completed
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
