// src/pages/Admin/AllChallenges.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Edit, Trash2, Eye, X, ChevronDown, Plus, Trash2 as TrashSmall } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const normalizeStep = (step) => ({
  _id: step?._id || Date.now(),
  name: step?.name || "",
  type: step?.type || "time",
  duration: step?.duration ?? 30,
  reps: step?.reps ?? 12,
  image: step?.image || null,
  calories: step?.calories ?? 0,
});

const normalizeDay = (day, index) => ({
  _id: day?._id || Date.now() + index,
  title: day?.title || `Day ${index + 1}`,
  steps: (day?.steps || []).map(normalizeStep),
  totalTime: day?.totalTime ?? 0,
  totalCalories: day?.totalCalories ?? 0,
});

export default function AllChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dropdown, setDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "view" | "edit"
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [editChallenge, setEditChallenge] = useState(null);

  // Fetch all challenges
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/challenges");
      const mapped = res.data.map((c) => ({
        _id: c._id,
        title: c.title || "Untitled",
        thumbnail: c.thumbnail || "/default-thumbnail.png",
        price: c.price || 0,
        difficulty: c.difficulty || "Beginner",
        totalDays: c.totalDays || c.days?.length || 0,
        totalCalories: c.totalCalories || "0 kcal",
        status: c.status || "Active",
        description: c.description || "",
        categories: c.categories || [],
        equipment: c.equipment || [],
        plans: c.plans || [],
        days: (c.days || []).map(normalizeDay),
      }));
      setChallenges(mapped);
    } catch (err) {
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
    const handler = () => fetchChallenges();
    window.addEventListener("challengeSaved", handler);
    return () => window.removeEventListener("challengeSaved", handler);
  }, []);

  // Filtering + Pagination
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const match =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filterStatus === "All" || c.status === filterStatus;
      return match && statusMatch;
    });
  }, [challenges, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredChallenges.length / ITEMS_PER_PAGE);
  const paginated = filteredChallenges.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Open Modal with Full Data
  const openModal = async (type, challenge) => {
    setModalType(type);
    setSelectedChallenge(challenge);

    if (type === "edit") {
      try {
        const res = await axios.get(`http://localhost:5000/api/challenges/${challenge._id}`);
        const data = res.data;

        setEditChallenge({
          _id: data._id,
          title: data.title || "Untitled",
          description: data.description || "",
          price: data.price || 0,
          difficulty: data.difficulty || "Beginner",
          totalDays: data.totalDays || data.days?.length || 0,
          totalCalories: data.totalCalories || 0,
          status: data.status || "Active",
          thumbnail: data.thumbnail ? { url: data.thumbnail } : null,
          categories: data.categories || [],
          equipment: data.equipment || [],
          plans: data.plans || [],
          days: (data.days || []).map((day, dayIdx) => ({
            _id: day._id || Date.now() + dayIdx,
            title: day.title || `Day ${dayIdx + 1}`,
            steps: (day.steps || []).map((step) => ({
              _id: step._id || Date.now(),
              name: step.name || "",
              type: step.type || "time",
              duration: step.duration || 30,
              reps: step.reps || 12,
              image: step.image ? { url: step.image } : null,
              calories: step.calories || 0,
            })),
            totalTime: day.totalTime || 0,
            totalCalories: day.totalCalories || 0,
          })),
        });
      } catch (err) {
        toast.error("Failed to load full challenge");
      }
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType("");
    setSelectedChallenge(null);
    setEditChallenge(null);
  };

  // Save Edited Challenge
  const saveEdit = async () => {
    if (!editChallenge) return;

    try {
      const formData = new FormData();

      const cleanData = {
        _id: editChallenge._id,
        title: editChallenge.title,
        description: editChallenge.description,
        price: editChallenge.price,
        difficulty: editChallenge.difficulty,
        totalDays: editChallenge.totalDays,
        totalCalories: editChallenge.totalCalories,
        status: editChallenge.status,
        categories: editChallenge.categories,
        equipment: editChallenge.equipment,
        plans: editChallenge.plans || [],
        thumbnail: editChallenge.thumbnail?.url || editChallenge.thumbnail || "",
        days: editChallenge.days.map((d) => ({
          ...d,
          steps: d.steps.map((step) => ({
            _id: step._id,
            name: step.name,
            type: step.type,
            duration: step.duration || 0,
            reps: step.reps || 0,
            calories: step.calories || 0,
            image: step.image?.url || step.image || null,
          })),
        })),
      };

      formData.append("data", JSON.stringify(cleanData));

      if (editChallenge.thumbnail?.file) {
        formData.append("thumbnail", editChallenge.thumbnail.file);
      }

      editChallenge.days.forEach((day, dayIdx) => {
        day.steps.forEach((step, stepIdx) => {
          if (step.image?.file) {
            const key = `step-${dayIdx}-${stepIdx}`;
            formData.append(key, step.image.file);
            console.log("Appending step image:", key); 
          }
        });
      });

      await axios.put(
        `http://localhost:5000/api/challenges/${editChallenge._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Challenge updated successfully!");
      fetchChallenges();
      closeModal();
    } catch (err) {
      console.error("saveEdit ERROR:", err.response?.data || err.message);
      toast.error(`Failed to save: ${err.response?.data?.error || err.message}`);
    }
  };

  const deleteChallenge = async (_id) => {
    if (!window.confirm("Delete this challenge permanently?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/challenges/${_id}`);
      toast.success("Challenge deleted");
      fetchChallenges();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const toggleStatus = async (_id) => {
    const challenge = challenges.find((c) => c._id === _id);
    const newStatus = challenge.status === "Active" ? "Inactive" : "Active";
    try {
      await axios.patch(`http://localhost:5000/api/challenges/${_id}/status`, { status: newStatus });
      setChallenges((prev) => prev.map((c) => (c._id === _id ? { ...c, status: newStatus } : c)));
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  if (loading) return <div className="p-10 text-center text-xl">Loading challenges...</div>;

  return (
    <div className="p-6 bg-white rounded-lg min-h-screen">
      <ToastContainer theme="dark" position="top-right" />

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Challenges</h1>
          <p className="text-gray-600">Manage and edit your challenges</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search challenges..."
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
              <th className="px-6 py-5 text-left">Challenge</th>
              <th className="px-6 py-5 text-left">Difficulty</th>
              <th className="px-6 py-5 text-left">Total Days</th>
              <th className="px-6 py-5 text-left font-bold">Price</th>
              <th className="px-6 py-5 text-left">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-gray-500">
                  No challenges found
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
                      <p className="font-semibold">{c.title}</p>
                      <p className="text-xs text-gray-500">
                        {c.days.length} days • {c.days.reduce((a, d) => a + d.steps.length, 0)} steps
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{c.difficulty}</span>
                  </td>
                  <td className="px-6 py-5">{c.totalDays} days</td>
                  <td className="px-6 py-5 font-bold">₹{c.price}</td>
                  <td className="px-6 py-5">
                    <StatusToggle status={c.status} onToggle={() => toggleStatus(c._id)} />
                  </td>
                  <td className="px-6 py-5 text-right gap-2">
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
                      onClick={() => deleteChallenge(c._id)}
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
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredChallenges.length)} of {filteredChallenges.length}
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

      {/* Edit Modal */}
      {modalOpen && modalType === "edit" && editChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Edit Challenge: <span className="text-[#e3002a]">{editChallenge.title || "Untitled"}</span>
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <input
                value={editChallenge.title || ""}
                onChange={(e) => setEditChallenge((c) => ({ ...c, title: e.target.value }))}
                className="w-full text-3xl sm:text-4xl font-bold outline-none border-b border-gray-300 pb-2 focus:border-[#e3002a] transition"
                placeholder="Challenge Title"
              />

              <textarea
                value={editChallenge.description || ""}
                onChange={(e) => setEditChallenge((c) => ({ ...c, description: e.target.value }))}
                className="w-full p-4 border rounded-2xl h-36 resize-none shadow-sm focus:ring-1 focus:ring-[#e3002a] focus:border-[#e3002a] transition"
                placeholder="Challenge Description"
              />

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Challenge Thumbnail</label>
                {editChallenge.thumbnail ? (
                  <img
                    src={editChallenge.thumbnail.url || editChallenge.thumbnail}
                    className="w-64 h-40 object-cover rounded-xl shadow"
                    alt="Challenge"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditChallenge((c) => ({
                      ...c,
                      thumbnail: e.target.files[0]
                        ? { file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) }
                        : null,
                    }))
                  }
                  className="mt-2"
                />
              </div>

              {/* Database Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                <select
                  value={editChallenge.difficulty || "Beginner"}
                  onChange={(e) => setEditChallenge((c) => ({ ...c, difficulty: e.target.value }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>

                <div className="flex items-center border rounded-xl shadow-sm focus-within:ring-1 focus-within:ring-[#e3002a]">
                  <span className="px-4 text-xl font-bold text-gray-700">₹</span>
                  <input
                    type="number"
                    value={editChallenge.price || 0}
                    onChange={(e) => setEditChallenge((c) => ({ ...c, price: Number(e.target.value) || 0 }))}
                    className="flex-1 p-3 outline-none"
                    placeholder="Price"
                  />
                </div>

                <input
                  type="number"
                  value={editChallenge.totalDays || ""}
                  onChange={(e) => setEditChallenge((c) => ({ ...c, totalDays: Number(e.target.value) || 0 }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                  placeholder="Total Days"
                />

                <input
                  value={editChallenge.totalCalories || ""}
                  onChange={(e) => setEditChallenge((c) => ({ ...c, totalCalories: Number(e.target.value) || 0 }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                  placeholder="Total Calories"
                />

                <input
                  value={editChallenge.categories?.join(", ") || ""}
                  onChange={(e) => setEditChallenge((c) => ({ ...c, categories: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                  placeholder="Categories (comma separated)"
                />

                <input
                  value={editChallenge.equipment?.join(", ") || ""}
                  onChange={(e) => setEditChallenge((c) => ({ ...c, equipment: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                  placeholder="Equipment (comma separated)"
                />

                <select
                  value={editChallenge.status || "Active"}
                  onChange={(e) => setEditChallenge((c) => ({ ...c, status: e.target.value }))}
                  className="p-3 border rounded-xl shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              {/* Plans Assignment */}
              <div className="flex flex-col gap-3">
                <label className="font-semibold text-gray-700 text-lg">Assign Plans</label>
                <div className="flex gap-3 flex-wrap">
                  {["Basic", "Premium", "Pro"].map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() =>
                        setEditChallenge((prev) => {
                          const plans = prev.plans || [];
                          return plans.includes(plan)
                            ? { ...prev, plans: plans.filter((p) => p !== plan) }
                            : { ...prev, plans: [...plans, plan] };
                        })
                      }
                      className={`px-5 py-2 rounded-full border text-sm font-medium transition-all duration-200
                        ${editChallenge.plans?.includes(plan)
                          ? "bg-[#e3002a] text-white border-[#e3002a] shadow-md scale-105"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
                <p className="text-gray-500 text-sm">
                  Users with selected plans will have access to this challenge via membership.
                </p>
              </div>

              {/* Days & Steps Editor */}
              {editChallenge.days?.map((day, dayIdx) => (
                <div key={day._id || dayIdx} className="border rounded-2xl p-6 bg-gray-50 shadow-sm space-y-4">
                  <input
                    value={day.title || ""}
                    onChange={(e) =>
                      setEditChallenge((c) => ({
                        ...c,
                        days: c.days.map((d, i) => (i === dayIdx ? { ...d, title: e.target.value } : d)),
                      }))
                    }
                    className="text-xl font-semibold w-full outline-none bg-transparent border-b border-gray-300 pb-2 focus:border-[#e3002a] transition"
                    placeholder="Day Title"
                  />

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="number"
                      value={day.totalTime || ""}
                      onChange={(e) =>
                        setEditChallenge((c) => ({
                          ...c,
                          days: c.days.map((d, i) => (i === dayIdx ? { ...d, totalTime: Number(e.target.value) || 0 } : d)),
                        }))
                      }
                      className="p-3 border rounded-xl shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                      placeholder="Total Time (seconds)"
                    />
                    <input
                      type="number"
                      value={day.totalCalories || ""}
                      onChange={(e) =>
                        setEditChallenge((c) => ({
                          ...c,
                          days: c.days.map((d, i) => (i === dayIdx ? { ...d, totalCalories: Number(e.target.value) || 0 } : d)),
                        }))
                      }
                      className="p-3 border rounded-xl shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                      placeholder="Total Calories"
                    />
                  </div>

                  {day.steps?.map((step, stepIdx) => (
                    <div key={step._id || stepIdx} className="bg-white rounded-xl p-4 mb-4 border shadow-sm flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-32 h-28 bg-gray-200 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden">
                        {step.image ? (
                          <img src={step.image.url || step.image} className="w-full h-full object-cover" alt="step" />
                        ) : (
                          <span className="text-gray-400 text-xs">No Image</span>
                        )}
                      </div>

                      <div className="flex-1 space-y-3">
                        <input
                          value={step.name || ""}
                          onChange={(e) =>
                            setEditChallenge((c) => ({
                              ...c,
                              days: c.days.map((d, i) =>
                                i === dayIdx
                                  ? {
                                    ...d,
                                    steps: d.steps.map((s, j) =>
                                      j === stepIdx ? { ...s, name: e.target.value } : s
                                    ),
                                  }
                                  : d
                              ),
                            }))
                          }
                          className="w-full p-2 border rounded-lg shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                          placeholder="Step Name"
                        />

                        <div className="flex gap-3 flex-wrap">
                          <select
                            value={step.type || "time"}
                            onChange={(e) =>
                              setEditChallenge((c) => ({
                                ...c,
                                days: c.days.map((d, i) =>
                                  i === dayIdx
                                    ? {
                                      ...d,
                                      steps: d.steps.map((s, j) =>
                                        j === stepIdx ? { ...s, type: e.target.value } : s
                                      ),
                                    }
                                    : d
                                ),
                              }))
                            }
                            className="p-2 border rounded-lg shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                          >
                            <option value="time">Time</option>
                            <option value="reps">Reps</option>
                          </select>

                          {step.type === "time" ? (
                            <input
                              type="number"
                              value={step.duration || ""}
                              onChange={(e) =>
                                setEditChallenge((c) => ({
                                  ...c,
                                  days: c.days.map((d, i) =>
                                    i === dayIdx
                                      ? {
                                        ...d,
                                        steps: d.steps.map((s, j) =>
                                          j === stepIdx ? { ...s, duration: Number(e.target.value) || 0 } : s
                                        ),
                                      }
                                      : d
                                  ),
                                }))
                              }
                              placeholder="Seconds"
                              className="p-2 border rounded-lg w-24 shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                            />
                          ) : (
                            <input
                              type="number"
                              value={step.reps || ""}
                              onChange={(e) =>
                                setEditChallenge((c) => ({
                                  ...c,
                                  days: c.days.map((d, i) =>
                                    i === dayIdx
                                      ? {
                                        ...d,
                                        steps: d.steps.map((s, j) =>
                                          j === stepIdx ? { ...s, reps: Number(e.target.value) || 0 } : s
                                        ),
                                      }
                                      : d
                                  ),
                                }))
                              }
                              placeholder="Reps"
                              className="p-2 border rounded-lg w-24 shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                            />
                          )}

                          <input
                            type="number"
                            value={step.calories || ""}
                            onChange={(e) =>
                              setEditChallenge((c) => ({
                                ...c,
                                days: c.days.map((d, i) =>
                                  i === dayIdx
                                    ? {
                                      ...d,
                                      steps: d.steps.map((s, j) =>
                                        j === stepIdx ? { ...s, calories: Number(e.target.value) || 0 } : s
                                      ),
                                    }
                                    : d
                                ),
                              }))
                            }
                            placeholder="Calories"
                            className="p-2 border rounded-lg w-24 shadow-sm focus:ring-1 focus:ring-[#e3002a]"
                          />
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setEditChallenge((c) => ({
                              ...c,
                              days: c.days.map((d, i) =>
                                i === dayIdx
                                  ? {
                                    ...d,
                                    steps: d.steps.map((s, j) =>
                                      j === stepIdx
                                        ? {
                                          ...s,
                                          image: e.target.files[0]
                                            ? { file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) }
                                            : null,
                                        }
                                        : s
                                    ),
                                  }
                                  : d
                              ),
                            }))
                          }
                          className="mt-2"
                        />
                      </div>

                      <button
                        onClick={() =>
                          setEditChallenge((c) => ({
                            ...c,
                            days: c.days.map((d, i) =>
                              i === dayIdx ? { ...d, steps: d.steps.filter((_, j) => j !== stepIdx) } : d
                            ),
                          }))
                        }
                        className="text-red-600 hover:bg-red-50 p-2 rounded transition self-start md:self-auto"
                      >
                        <TrashSmall size={20} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      setEditChallenge((c) => ({
                        ...c,
                        days: c.days.map((d, i) =>
                          i === dayIdx ? { ...d, steps: [...d.steps, normalizeStep({})] } : d
                        ),
                      }))
                    }
                    className="text-[#e3002a] flex items-center gap-2 mt-4 font-semibold hover:text-[#c90024] transition"
                  >
                    <Plus size={18} /> Add Step
                  </button>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row justify-between pt-6 gap-4">
                <button
                  onClick={() =>
                    setEditChallenge((c) => ({
                      ...c,
                      days: [...c.days, { _id: Date.now(), title: `Day ${c.days.length + 1}`, steps: [] }],
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

      {/* View Modal - Cleaned */}
      {modalOpen && modalType === "view" && selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold">{selectedChallenge.title}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <img
              src={selectedChallenge.thumbnail}
              className="w-full h-64 object-cover rounded-xl mb-6"
              onError={(e) => (e.target.src = "/default-thumbnail.png")}
              alt="Challenge thumbnail"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-blue-800 mb-2">Pricing</h3>
                <p className="text-2xl font-bold text-blue-600">₹{selectedChallenge.price}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-green-800 mb-2">Difficulty</h3>
                <span className="px-4 py-2 bg-green-200 text-green-800 rounded-full font-medium">{selectedChallenge.difficulty}</span>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-purple-800 mb-2">Total Days</h3>
                <p className="text-lg font-medium">{selectedChallenge.totalDays} days</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-orange-800 mb-2">Total Calories</h3>
                <p className="text-lg font-medium">{selectedChallenge.totalCalories} kcal</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-teal-800 mb-2">Status</h3>
                <span className={`px-4 py-2 rounded-full font-medium ${selectedChallenge.status === "Active"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
                  }`}>
                  {selectedChallenge.status}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed">{selectedChallenge.description || "No description available."}</p>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h3 className="font-semibold text-gray-800 mb-4">Challenge Structure</h3>
              <p className="text-sm text-gray-600">
                {selectedChallenge.days.length} days • {selectedChallenge.days.reduce((a, d) => a + d.steps.length, 0)} steps total
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}