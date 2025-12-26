import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
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
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Flame,
  Dumbbell,
  Heart,
  Brain,
  Utensils,
  Zap,
  Activity,
  ChevronDown,
  Search,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const THEME_COLOR = "#e3002a";



const createEmptyEvent = () => ({
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  userId: "",
  completed: false,
});

const UserDropdown = ({ allUsers, selectedUser, setSelectedUser }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const displayName =
    selectedUser === null
      ? "All Users"
      : allUsers.find((u) => u._id === selectedUser)?.name || "Select User";

  const handleSelect = (userId) => {
    setSelectedUser(userId ?? null);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative w-64">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 flex justify-between items-center shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e3002a]"
      >
        <span className="truncate">{displayName}</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e3002a]"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            <div
              onClick={() => handleSelect(null)}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 font-medium"
            >
              All Users
            </div>
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                onClick={() => handleSelect(u._id)}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
              >
                {u.name}
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="px-4 py-2 text-sm text-gray-400">No users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const EventCard = ({ ev, onClick }) => {

  const userName =
    ev.userId?.name ||
    ev.userName ||
    (typeof ev.userId === "string" && allUsers.find(u => u._id === ev.userId)?.name) ||
    "Unknown User";
  return (
    <div
      onClick={onClick}
      className="flex flex-col px-2 py-1 rounded-xl text-xs shadow-sm cursor-pointer hover:shadow-md transition bg-gray-100 text-gray-800"
    >
      <div className="flex items-center gap-1 font-medium truncate">
        <Activity size={12} />
        <span className="truncate">{ev.title}</span>
      </div>
      <div className="text-[10px] text-gray-600">
        {ev.startTime}
        {ev.endTime ? ` - ${ev.endTime}` : ""}
      </div>
      <div className="text-[10px] text-gray-700 truncate">{userName}</div>
      <div className="mt-1">
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${ev.source === "program"
            ? "bg-blue-100 text-blue-800"
            : ev.source === "challenge"
              ? "bg-purple-100 text-purple-800"
              : ev.source === "class"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
        >
          {ev.source === "program"
            ? "Program"
            : ev.source === "challenge"
              ? "Challenge"
              : ev.source === "class"
                ? "Class"
                : "Manual"}
        </span>
      </div>
      {ev.completed && <CheckCircle2 size={14} className="text-green-600 mt-1" />}
    </div>
  );
};

export default function AdminSchedule() {
  const { admin } = useAdminAuth();
  const token = admin?.token;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(createEmptyEvent());
  const [selectedUser, setSelectedUser] = useState(null); // null = All Users

  const BASE_URL = "http://localhost:5000/api/schedule";

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          withCredentials: true, // 🔥 THIS IS ENOUGH
        }
      );

      if (res.data.success) {
        const normalized = res.data.users.map(u => ({
          ...u,
          _id: u._id || u.id,
        }));
        setAllUsers(normalized);
      }
    } catch (err) {
      console.error("Fetch users failed:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (!modalOpen) {
      setNewEvent(createEmptyEvent());
      setSelectedEvent(null);
    }
  }, [modalOpen]);


  useEffect(() => {
    const fetchEvents = async () => {
      if (!token) return;
      try {
        const month = format(currentMonth, "yyyy-MM");
        const params = { month };
        if (selectedUser !== null) {
          params.userId = selectedUser;  // ← Yeh line add karo
        }

        const res = await axios.get(`${BASE_URL}/admin`, {
          params,  // ← params object pass karo
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (res.data.success) setEvents(res.data.events || []);
      } catch (err) {
        console.error("Fetch events error:", err);
      }
    };
    fetchEvents();
  }, [currentMonth, token, selectedUser]);

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

  const closeModal = () => setModalOpen(false);

  const handleSave = async () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.userId) {
      alert("Please fill Title, Start Time & User.");
      return;
    }
    try {
      if (selectedEvent) {
        const res = await axios.put(
          `${BASE_URL}/${selectedEvent._id}`,
          newEvent,
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
        setEvents((prev) =>
          prev.map((ev) => (ev._id === selectedEvent._id ? res.data.event : ev))
        );
      } else {
        const res = await axios.post(
          BASE_URL,
          { ...newEvent, date: format(selectedDate, "yyyy-MM-dd") },
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
        setEvents((prev) => [...prev, res.data.event || res.data]);
      }
      closeModal();
    } catch (err) {
      console.error("Save event error:", err);
      alert("Failed to save workout");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this workout?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
      closeModal();
    } catch (err) {
      console.error(err);
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
    const map = {};
    events.forEach((ev) => {
      let userName = "Unknown User";
      let eventUserId = "";
      if (ev.userId) {
        if (typeof ev.userId === "object" && ev.userId.name) {
          userName = ev.userId.name;
          eventUserId = ev.userId._id.toString();
        } else if (typeof ev.userId === "string") {
          eventUserId = ev.userId;
          const found = allUsers.find((u) => u._id === eventUserId);
          userName = found?.name || "Unknown User";
        }
      }
      ev.displayUserName = userName;
      if (selectedUser === null || eventUserId === selectedUser) {
        const dateKey = ev.date;
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(ev);
      }
    });
  });
  Object.keys(map).forEach((date) => {
    map[date].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  });
  return map;
}, [events, selectedUser]);

return (
  <div className="min-h-screen bg-white rounded-lg  p-6 md:p-10">
    <div className="max-w-7xl mx-auto mb-6">
      <h1 className="text-3xl font-extrabold text-gray-900">Admin Schedule</h1>
      <p className="text-sm text-gray-500">Manage all users' workouts and schedules</p>
    </div>

    <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-gray-100">
            <ChevronLeft size={20} color={THEME_COLOR} />
          </button>
          <h2 className="text-2xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
          <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-100">
            <ChevronRight size={20} color={THEME_COLOR} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <UserDropdown
            allUsers={allUsers}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
          <button
            onClick={() => openModal(new Date())}
            className="flex items-center gap-2 bg-gradient-to-r from-[#e3002a] to-pink-600 text-white px-4 py-2 rounded-lg shadow-md hover:brightness-95 transition"
          >
            <Plus size={16} /> Add Workout
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 text-center text-gray-600 font-semibold text-xs mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-3">
        {daysMatrix.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-3">
            {week.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const dayEvents = eventsByDate[dayKey] || [];
              const inMonth = isSameMonth(day, currentMonth);

              return (
                <motion.div
                  key={dayKey}
                  onClick={() => openModal(day)}
                  className={`rounded-2xl p-3 min-h-[120px] cursor-pointer shadow-sm hover:shadow-md transition border ${inMonth ? "bg-white" : "bg-gray-50 opacity-60"
                    } ${isToday(day) ? "ring-2 ring-[#e3002a]" : "border-transparent"}`}
                >
                  <div className="flex justify-between mb-2">
                    <div
                      className={`font-semibold text-lg ${isToday(day) ? "text-[#e3002a]" : "text-gray-800"
                        }`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="text-xs text-gray-500">{dayEvents.length}</div>
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <EventCard
                        key={ev._id}
                        ev={ev}
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(day, ev);
                        }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[12px] text-center text-gray-500">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                    {dayEvents.length === 0 && (
                      <div className="text-[11px] text-gray-400 text-center">
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

    {/* Modal */}
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 max-h-[95vh] overflow-y-auto"
            initial={{ y: 50, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 50, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <h3 className="text-xl font-bold">
                {selectedEvent
                  ? "Edit Workout"
                  : `New Workout — ${format(selectedDate, "EEE, dd MMM yyyy")}`}
              </h3>
              <div className="flex gap-2">
                {selectedEvent && (
                  <button
                    onClick={() => handleDelete(selectedEvent._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent((s) => ({ ...s, title: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  placeholder="e.g. Morning Run"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">User</label>
                <UserDropdown
                  allUsers={allUsers}
                  selectedUser={newEvent.userId}
                  setSelectedUser={(val) => setNewEvent((s) => ({ ...s, userId: val || "" }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) =>
                      setNewEvent((s) => ({ ...s, startTime: e.target.value }))
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">End Time (optional)</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) =>
                      setNewEvent((s) => ({ ...s, endTime: e.target.value }))
                    }
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
                <textarea
                  value={newEvent.description || ""}
                  onChange={(e) => setNewEvent((s) => ({ ...s, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full border rounded-lg px-3 py-2 resize-none"
                  placeholder="Any additional instructions..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-[#e3002a] to-pink-600 text-white rounded-lg shadow-md hover:brightness-110 transition"
              >
                {selectedEvent ? "Update Workout" : "Save Workout"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
}
