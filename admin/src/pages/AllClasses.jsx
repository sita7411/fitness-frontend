// src/pages/AllClasses.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Edit, Trash2, Eye, X, ChevronDown, Plus, Trash2 as TrashSmall } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 6;

const StatusToggle = ({ status, onToggle }) => {
  const isActive = status?.toLowerCase() === "active";
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center h-7 w-14 rounded-full transition ${isActive ? "bg-green-500" : "bg-gray-300"}`}
    >
      <span className={`absolute w-6 h-6 bg-white rounded-full shadow transform transition ${isActive ? "translate-x-7" : "translate-x-1"}`}></span>
    </button>
  );
};

const normalizeExercise = (ex) => ({
  _id: ex?._id || Date.now(),
  title: ex?.title || "",
  type: ex?.type || "time",
  time: ex?.time ?? 30,
  reps: ex?.reps ?? 12,
  sets: ex?.sets ?? 3,
  notes: ex?.notes || "",
  thumbnail: ex?.thumbnail || null,
});

const normalizeDay = (day, index) => ({
  _id: day?._id || Date.now() + index,
  title: day?.title || `Day ${index + 1}`,
  exercises: (day?.exercises || []).map(normalizeExercise),
});

export default function AllClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dropdown, setDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "view" | "edit"
  const [selectedClass, setSelectedClass] = useState(null);
  const [editClass, setEditClass] = useState(null);

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/classes`);
      const mapped = res.data.map((c) => ({
        _id: c._id,
        name: c.title || "Untitled",
        thumbnail: c.thumbnail || "/default-thumbnail.png",
        price: c.price || 0,
        level: c.level || "Beginner",
        duration: c.duration || "30 – 45 min",
        status: c.status || "Active",
        description: c.description || "",
        trainerName: c.trainerName || "",
        includedInProgram: c.includedInProgram || false,
        date: c.date || "",
        time: c.time || "",
        caloriesBurned: c.caloriesBurned || "0 kcal",
        days: (c.days || []).map(normalizeDay),
      }));
      setClasses(mapped);
    } catch (err) {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    const handler = () => fetchClasses();
    window.addEventListener("classSaved", handler);
    return () => window.removeEventListener("classSaved", handler);
  }, []);

  // Filtering + Pagination
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const match =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filterStatus === "All" || c.status === filterStatus;
      return match && statusMatch;
    });
  }, [classes, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);
  const paginated = filteredClasses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Open Modal with Full Data
  const openModal = async (type, cls) => {
    setModalType(type);
    setSelectedClass(cls);

    if (type === "edit") {
      try {
        const res = await axios.get(`${API_URL}/api/classes/${cls._id}`);
        const data = res.data;

        setEditClass({
          _id: data._id,
          title: data.title || "Untitled",
          description: data.description || "",
          price: data.price || 0,
          level: data.level || "Beginner",
          duration: data.duration || "30 – 45 min",
          trainerName: data.trainerName || "",
          status: data.status || "Active",
          includedInProgram: data.includedInProgram || false,
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : "",
          time: data.time || "",
          caloriesBurned: data.caloriesBurned || "0 kcal",
          plans: data.plans || [],
          equipment: Array.isArray(data.equipment) ? data.equipment : [],
          thumbnail: data.thumbnail ? { url: data.thumbnail } : null,
          days: (data.days || []).map((day, dayIdx) => ({
            _id: day._id || Date.now() + dayIdx,
            title: day.title || `Day ${dayIdx + 1}`,
            exercises: (day.exercises || []).map((ex) => ({
              _id: ex._id || Date.now(),
              title: ex.title || "",
              type: ex.type || "time",
              time: ex.time || 30,
              reps: ex.reps || 12,
              sets: ex.sets || 3,
              notes: ex.notes || "",
              section: ex.section || "Workout",
              thumbnail: ex.thumbnail ? { url: ex.thumbnail } : null,
            })),
          })),
        });
      } catch (err) {
        toast.error("Failed to load full class");
      }
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType("");
    setSelectedClass(null);
    setEditClass(null);
  };

  // Save Edited Class
  const saveEdit = async () => {
    if (!editClass) return;

    try {
      const formData = new FormData();

      const cleanData = {
        ...editClass,
        plans: editClass.plans || [],
        date: editClass.date || null,
        equipment: editClass.equipment || [],
        thumbnail: editClass.thumbnail
          ? typeof editClass.thumbnail === "string"
            ? editClass.thumbnail
            : editClass.thumbnail.url || null
          : null,

        days: editClass.days.map((d) => ({
          ...d,
          exercises: d.exercises.map((ex) => ({
            ...ex,
            thumbnail: ex.thumbnail
              ? typeof ex.thumbnail === "string"
                ? ex.thumbnail
                : ex.thumbnail.url || null
              : null,
          })),
        })),
      };

      formData.append("data", JSON.stringify(cleanData));

      // Main thumbnail file
      if (editClass.thumbnail?.file) {
        formData.append("thumbnail", editClass.thumbnail.file);
      }

      editClass.days.forEach((day, dayIdx) => {
        day.exercises.forEach((ex, exIdx) => {
          if (ex.thumbnail?.file) {
            formData.append(`exercise_${dayIdx}_${exIdx}`, ex.thumbnail.file);
          }
        });
      });

      await axios.put(
        `${API_URL}/api/classes/${editClass._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Class updated successfully!");
      fetchClasses();
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Update failed: " + (err.response?.data?.message || err.message));
    }
  };


  const deleteClass = async (_id) => {
    if (!window.confirm("Delete this class permanently?")) return;
    try {
      await axios.delete(`${API_URL}/api/classes/${_id}`);
      setClasses((prev) => prev.filter((c) => c._id !== _id));
      toast.success("Class deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const toggleStatus = async (_id) => {
    const cls = classes.find((c) => c._id === _id);
    const newStatus = cls.status === "Active" ? "Inactive" : "Active";
    try {
      await axios.patch(`${API_URL}/api/classes/${_id}/status`, { status: newStatus });
      setClasses((prev) => prev.map((c) => (c._id === _id ? { ...c, status: newStatus } : c)));
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  if (loading) return <div className="p-10 text-center text-xl">Loading classes...</div>;

  return (
    <div className="p-6 bg-white rounded-lg min-h-screen">
      <ToastContainer theme="dark" position="top-right" />

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Classes</h1>
          <p className="text-gray-600">Manage and edit your classes</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search classes..."
          className="flex-1 px-5 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="relative">
          <button
            onClick={() => setDropdown(!dropdown)}
            className="px-6 py-3 border rounded-xl bg-white flex items-center gap-2"
          >
            {filterStatus} <ChevronDown size={18} />
          </button>
          {dropdown && (
            <div className="absolute top-full mt-2 w-full bg-white border rounded-xl shadow-lg z-10">
              {["All", "Active", "Inactive"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setFilterStatus(s);
                    setDropdown(false);
                    setCurrentPage(1);
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#e3002a] text-white">
            <tr>
              <th className="px-6 py-5 text-left">Class</th>
              <th className="px-6 py-5 text-left">Level</th>
              <th className="px-6 py-5 text-left">Duration</th>
              <th className="px-6 py-5 text-left font-bold">Price</th>
              <th className="px-6 py-5 text-left">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-gray-500">
                  No classes found
                </td>
              </tr>
            ) : (
              paginated.map((c) => (
                <tr key={c._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-5 flex items-center gap-4">
                    <img
                      src={c.thumbnail}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover"
                      onError={(e) => (e.target.src = "/default-thumbnail.png")}
                    />
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-gray-500">
                        {c.days.length} days • {c.days.reduce((a, d) => a + d.exercises.length, 0)} exercises
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{c.level}</span>
                  </td>
                  <td className="px-6 py-5">{c.duration}</td>
                  <td className="px-6 py-5 font-bold">₹{c.price}</td>
                  <td className="px-6 py-5">
                    <StatusToggle status={c.status} onToggle={() => toggleStatus(c._id)} />
                  </td>
                  <td className="px-6 py-5 text-right  gap-2">
                    <button
                      onClick={() => openModal("view", c)}
                      className="text-gray-600 hover:text-gray-900 p-1 rounded"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => openModal("edit", c)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteClass(c._id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredClasses.length)} of {filteredClasses.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? "bg-[#e3002a] text-white" : "border"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Edit Modal */}
      {modalOpen && modalType === "edit" && editClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Edit Class: <span className="text-[#e3002a]">{editClass.title || "Untitled"}</span>
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8">

              {/* Class Title */}
              <input
                value={editClass.title || ""}
                onChange={(e) => setEditClass((c) => ({ ...c, title: e.target.value }))}
                className="w-full text-3xl sm:text-4xl font-bold outline-none border-b border-gray-300 pb-2 focus:border-[#e3002a] transition"
                placeholder="Class Title"
              />

              {/* Class Description */}
              <textarea
                value={editClass.description || ""}
                onChange={(e) => setEditClass((c) => ({ ...c, description: e.target.value }))}
                className="w-full p-4 border rounded-2xl h-36 resize-none shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 focus:border-[#e3002a] transition"
                placeholder="Class Description"
              />

              {/* Thumbnail */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Class Thumbnail</label>
                {editClass.thumbnail ? (
                  <img
                    src={editClass.thumbnail.url || editClass.thumbnail}
                    className="w-64 h-40 object-cover rounded-xl shadow-md"
                    alt="Class"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditClass((c) => ({
                      ...c,
                      thumbnail: {
                        file: e.target.files[0],
                        url: URL.createObjectURL(e.target.files[0]),
                      },
                    }))
                  }
                  className="mt-2"
                />
              </div>

              {/* Main Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">

                {/* Duration */}
                <input
                  value={editClass.duration || ""}
                  onChange={(e) => setEditClass((c) => ({ ...c, duration: e.target.value }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 focus:border-[#e3002a] transition"
                  placeholder="Duration (30-45 min)"
                />

                {/* Level */}
                <select
                  value={editClass.level || "Beginner"}
                  onChange={(e) => setEditClass((c) => ({ ...c, level: e.target.value }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 focus:border-[#e3002a] transition"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>

                {/* Price */}
                <div className="flex items-center border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#e3002a]/30 focus-within:border-[#e3002a]">
                  <span className="px-4 text-xl font-bold text-gray-700">₹</span>
                  <input
                    type="number"
                    value={editClass.price || 0}
                    onChange={(e) => setEditClass((c) => ({ ...c, price: Number(e.target.value) || 0 }))}
                    className="flex-1 p-3 outline-none"
                    placeholder="Price"
                  />
                </div>

                {/* Trainer Name */}
                <input
                  value={editClass.trainerName || ""}
                  onChange={(e) => setEditClass((c) => ({ ...c, trainerName: e.target.value }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 focus:border-[#e3002a] transition"
                  placeholder="Trainer Name"
                />

                {/* Date & Time */}
                <input
                  type="date"
                  value={editClass.date || ""}
                  onChange={(e) => setEditClass((c) => ({ ...c, date: e.target.value }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 focus:border-[#e3002a]"
                />
                <input
                  type="time"
                  value={editClass.time || ""}
                  onChange={(e) => setEditClass((c) => ({ ...c, time: e.target.value }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 focus:border-[#e3002a]"
                />

                {/* Calories */}
                <input
                  value={editClass.caloriesBurned || ""}
                  onChange={(e) => setEditClass((c) => ({ ...c, caloriesBurned: e.target.value }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 focus:border-[#e3002a]"
                  placeholder="Calories (300 kcal)"
                />

                {/* Included In Program */}
                <label className="flex items-center p-3 border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#e3002a]/30 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={editClass.includedInProgram || false}
                    onChange={(e) => setEditClass((c) => ({ ...c, includedInProgram: e.target.checked }))}
                    className="mr-3 rounded accent-[#e3002a] w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-700">Included in Program</span>
                </label>

                {/* Status */}
                <select
                  value={editClass.status || "Active"}
                  onChange={(e) => setEditClass((c) => ({ ...c, status: e.target.value }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 focus:border-[#e3002a] transition"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              {/* Plans */}
              <div className="col-span-full">
                <label className="font-semibold text-gray-700 text-lg mb-2 inline-block">Assign Plans</label>
                <div className="flex gap-3 flex-wrap">
                  {["Basic", "Premium", "Pro"].map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() =>
                        setEditClass((c) => {
                          const plans = c.plans || [];
                          return plans.includes(plan)
                            ? { ...c, plans: plans.filter((p) => p !== plan) }
                            : { ...c, plans: [...plans, plan] };
                        })
                      }
                      className={`px-5 py-2 rounded-full border text-sm font-medium transition duration-200 ${editClass.plans?.includes(plan)
                        ? "bg-[#e3002a] text-white border-[#e3002a] shadow-md"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="col-span-full">
                <label className="font-semibold text-gray-800 text-lg">Equipment Required</label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {(editClass.equipment || []).map((eq, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm bg-[#e3002a]"
                    >
                      {eq}
                      <button
                        onClick={() =>
                          setEditClass((c) => ({ ...c, equipment: c.equipment.filter((_, i) => i !== idx) }))
                        }
                        className="hover:bg-white/20 rounded-full p-0.5 transition"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {(!editClass.equipment || editClass.equipment.length === 0) && (
                    <span className="text-gray-400 text-sm italic">No equipment selected (Bodyweight only)</span>
                  )}
                </div>
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !editClass.equipment?.includes(val)) {
                      setEditClass((c) => ({ ...c, equipment: [...(c.equipment || []), val] }));
                    }
                    e.target.value = "";
                  }}
                  className="w-full p-4 mt-3 border-2 rounded-2xl focus:ring-2 focus:ring-[#e3002a]/30 focus:border-[#e3002a] transition"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <option value="" disabled>
                    Add Equipment...
                  </option>
                  {[
                    "None",
                    "Dumbbells",
                    "Kettlebells",
                    "Barbell",
                    "Resistance Bands",
                    "Pull-up Bar",
                    "Bench",
                    "Yoga Mat",
                    "Jump Rope",
                    "Machines",
                    "Bodyweight Only",
                  ]
                    .filter((opt) => !(editClass.equipment || []).includes(opt))
                    .map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                </select>
              </div>

              {/* Days & Exercises */}
              {Array.isArray(editClass.days) &&
                editClass.days.map((day, dayIdx) => (
                  <div key={day._id || dayIdx} className="border rounded-2xl p-6 bg-gray-50 shadow-md space-y-4">
                    {/* Day Header */}
                    <div className="flex justify-between items-center">
                      <input
                        value={day.title || ""}
                        onChange={(e) =>
                          setEditClass((c) => ({
                            ...c,
                            days: c.days.map((d, i) => (i === dayIdx ? { ...d, title: e.target.value } : d)),
                          }))
                        }
                        className="text-xl font-semibold w-full outline-none bg-transparent border-b border-gray-300 pb-1 focus:border-[#e3002a] transition"
                        placeholder="Day Title"
                      />
                      <button
                        onClick={() =>
                          setEditClass((c) => ({
                            ...c,
                            days: c.days.filter((_, i) => i !== dayIdx),
                          }))
                        }
                        className="text-red-600 hover:bg-red-50 p-2 rounded transition ml-4"
                      >
                        <TrashSmall size={20} />
                      </button>
                    </div>

                    {/* Exercises */}
                    {Array.isArray(day.exercises) &&
                      day.exercises.map((ex, exIdx) => (
                        <div
                          key={ex._id || exIdx}
                          className="bg-white rounded-xl p-4 border shadow-sm flex flex-col md:flex-row gap-4"
                        >
                          {/* Thumbnail */}
                          <div className="w-full md:w-32 h-28 bg-gray-200 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden">
                            {ex.thumbnail ? (
                              <img src={ex.thumbnail.url || ex.thumbnail} className="w-full h-full object-cover" alt="thumb" />
                            ) : (
                              <span className="text-gray-400 text-xs">No Image</span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 space-y-3">
                            <input
                              value={ex.title || ""}
                              onChange={(e) =>
                                setEditClass((c) => ({
                                  ...c,
                                  days: c.days.map((d, i) =>
                                    i === dayIdx
                                      ? {
                                        ...d,
                                        exercises: d.exercises.map((ee, j) =>
                                          j === exIdx ? { ...ee, title: e.target.value } : ee
                                        ),
                                      }
                                      : d
                                  ),
                                }))
                              }
                              className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 transition"
                              placeholder="Exercise Name"
                            />

                            <div className="flex gap-3 flex-wrap">
                              <select
                                value={ex.type || "time"}
                                onChange={(e) =>
                                  setEditClass((c) => ({
                                    ...c,
                                    days: c.days.map((d, i) =>
                                      i === dayIdx
                                        ? {
                                          ...d,
                                          exercises: d.exercises.map((ee, j) =>
                                            j === exIdx ? { ...ee, type: e.target.value } : ee
                                          ),
                                        }
                                        : d
                                    ),
                                  }))
                                }
                                className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 transition"
                              >
                                <option value="time">Time</option>
                                <option value="reps">Reps</option>
                              </select>

                              {(ex.type || "time") === "time" ? (
                                <input
                                  type="number"
                                  value={ex.time || ""}
                                  onChange={(e) =>
                                    setEditClass((c) => ({
                                      ...c,
                                      days: c.days.map((d, i) =>
                                        i === dayIdx
                                          ? {
                                            ...d,
                                            exercises: d.exercises.map((ee, j) =>
                                              j === exIdx ? { ...ee, time: Number(e.target.value) || 0 } : ee
                                            ),
                                          }
                                          : d
                                      ),
                                    }))
                                  }
                                  placeholder="Seconds"
                                  className="p-2 border rounded-lg w-24 shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 transition"
                                />
                              ) : (
                                <>
                                  <input
                                    type="number"
                                    value={ex.reps || ""}
                                    onChange={(e) =>
                                      setEditClass((c) => ({
                                        ...c,
                                        days: c.days.map((d, i) =>
                                          i === dayIdx
                                            ? {
                                              ...d,
                                              exercises: d.exercises.map((ee, j) =>
                                                j === exIdx ? { ...ee, reps: Number(e.target.value) || 0 } : ee
                                              ),
                                            }
                                            : d
                                        ),
                                      }))
                                    }
                                    placeholder="Reps"
                                    className="p-2 border rounded-lg w-20 shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 transition"
                                  />
                                  <input
                                    type="number"
                                    value={ex.sets || ""}
                                    onChange={(e) =>
                                      setEditClass((c) => ({
                                        ...c,
                                        days: c.days.map((d, i) =>
                                          i === dayIdx
                                            ? {
                                              ...d,
                                              exercises: d.exercises.map((ee, j) =>
                                                j === exIdx ? { ...ee, sets: Number(e.target.value) || 0 } : ee
                                              ),
                                            }
                                            : d
                                        ),
                                      }))
                                    }
                                    placeholder="Sets"
                                    className="p-2 border rounded-lg w-20 shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 transition"
                                  />
                                </>
                              )}
                            </div>

                            {/* Section & Notes */}
                            <select 
                              value={ex.section || "Workout"}
                              onChange={(e) =>
                                setEditClass((c) => ({
                                  ...c,
                                  days: c.days.map((d, i) =>
                                    i === dayIdx
                                      ? {
                                        ...d,
                                        exercises: d.exercises.map((ee, j) =>
                                          j === exIdx ? { ...ee, section: e.target.value } : ee
                                        ),
                                      }
                                      : d
                                  ),
                                }))
                              }
                              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#e3002a]/20 transition"
                            >
                              <option>Warm-up</option>
                              <option>Workout</option>
                              <option>Cool-down</option>
                            </select>

                            <textarea
                              value={ex.notes || ""}
                              onChange={(e) =>
                                setEditClass((c) => ({
                                  ...c,
                                  days: c.days.map((d, i) =>
                                    i === dayIdx
                                      ? {
                                        ...d,
                                        exercises: d.exercises.map((ee, j) =>
                                          j === exIdx ? { ...ee, notes: e.target.value } : ee
                                        ),
                                      }
                                      : d
                                  ),
                                }))
                              }
                              placeholder="Notes / Cues"
                              className="w-full p-2 border rounded-lg h-20 resize-none shadow-sm focus:ring-2 focus:ring-[#e3002a]/30 transition"
                            />

                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setEditClass((c) => ({
                                  ...c,
                                  days: c.days.map((d, i) =>
                                    i === dayIdx
                                      ? {
                                        ...d,
                                        exercises: d.exercises.map((ee, j) =>
                                          j === exIdx
                                            ? {
                                              ...ee,
                                              thumbnail: {
                                                file: e.target.files[0],
                                                url: URL.createObjectURL(e.target.files[0]),
                                              },
                                            }
                                            : ee
                                        ),
                                      }
                                      : d
                                  ),
                                }))
                              }
                              className="mt-2"
                            />
                          </div>
                        </div>
                      ))}

                    {/* Add Exercise Button */}
                    <button
                      onClick={() =>
                        setEditClass((c) => ({
                          ...c,
                          days: c.days.map((d, i) =>
                            i === dayIdx ? { ...d, exercises: [...d.exercises, normalizeExercise({})] } : d
                          ),
                        }))
                      }
                      className="text-[#e3002a] flex items-center gap-2 mt-4 font-semibold hover:text-[#c90024] transition"
                    >
                      <Plus size={18} /> Add Exercise
                    </button>
                  </div>
                ))}

              {/* Add Day / Save Buttons */}
              <div className="flex flex-col sm:flex-row justify-between pt-6 gap-4">
                <button
                  onClick={() =>
                    setEditClass((c) => ({
                      ...c,
                      days: [...c.days, { _id: Date.now(), title: `Day ${c.days.length + 1}`, exercises: [] }],
                    }))
                  }
                  className="px-6 py-3 border rounded-xl flex items-center gap-2 hover:bg-gray-50 font-medium transition"
                >
                  <Plus size={18} /> Add Day
                </button>

                <button
                  onClick={saveEdit}
                  className="px-8 py-3 bg-[#e3002a] text-white rounded-xl font-bold hover:bg-[#c90024] transition"
                >
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal - Updated with ALL fields */}
      {modalOpen && modalType === "view" && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold">{selectedClass.name}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <img
              src={selectedClass.thumbnail}
              className="w-full h-64 object-cover rounded-xl mb-6"
              onError={(e) => (e.target.src = "/default-thumbnail.png")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-blue-800 mb-2">Pricing</h3>
                <p className="text-2xl font-bold text-blue-600">₹{selectedClass.price}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-green-800 mb-2">Level</h3>
                <span className="px-4 py-2 bg-green-200 text-green-800 rounded-full font-medium">{selectedClass.level}</span>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-purple-800 mb-2">Duration</h3>
                <p className="text-lg font-medium">{selectedClass.duration}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-orange-800 mb-2">Trainer</h3>
                <p className="text-lg font-medium">{selectedClass.trainerName}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-indigo-800 mb-2">Calories</h3>
                <p className="text-lg font-medium">{selectedClass.caloriesBurned}</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-teal-800 mb-2">Status</h3>
                <span className={`px-4 py-2 rounded-full font-medium ${selectedClass.status === "Active"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
                  }`}>
                  {selectedClass.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Date & Time</h3>
                <p className="text-gray-600">
                  {selectedClass.date ? new Date(selectedClass.date).toLocaleDateString() : "Not scheduled"} • {selectedClass.time || "TBD"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Program Inclusion</h3>
                <span className={`px-4 py-2 rounded-full font-medium ${selectedClass.includedInProgram
                  ? "bg-blue-200 text-blue-800"
                  : "bg-gray-200 text-gray-800"
                  }`}>
                  {selectedClass.includedInProgram ? "✅ Included" : "❌ Standalone"}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed">{selectedClass.description || "No description available."}</p>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h3 className="font-semibold text-gray-800 mb-4">Workout Structure</h3>
              <p className="text-sm text-gray-600">
                {selectedClass.days.length} days • {selectedClass.days.reduce((a, d) => a + d.exercises.length, 0)} exercises total
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}