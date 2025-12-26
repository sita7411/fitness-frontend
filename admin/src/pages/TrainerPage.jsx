  // src/pages/AllTrainers.jsx
  import React, { useState, useMemo, useEffect } from "react";
  import axios from "axios";
  import { UserPlus, Edit, Trash2, Eye, X, ChevronDown } from "lucide-react";
  import { ToastContainer, toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";

  const ITEMS_PER_PAGE = 5;

  const StatusToggle = ({ status, onToggle }) => {
    const isActive = status === "Active";
    return (
      <button
        onClick={onToggle}
        disabled={status === "Pending"}
        className={`relative inline-flex items-center h-7 w-14 rounded-full transition ${isActive ? "bg-green-500" : "bg-gray-300"
          } ${status === "Pending" ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`absolute w-6 h-6 bg-white rounded-full shadow transform transition ${isActive ? "translate-x-7" : "translate-x-1"
            }`}
        />
      </button>
    );
  };

  export default function AllTrainers() {
    const [trainers, setTrainers] = useState([]);
    const [totalTrainers, setTotalTrainers] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [imagePreview, setImagePreview] = useState("");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // add | edit
    const [selectedTrainer, setSelectedTrainer] = useState(null);

    // Form state - always initialized with strings/arrays
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      status: "Active",
      workout: "",
      avatar: "",
      img: null,           // File object or string URL
      bio: "",
      specialties: [],     // array
      role: "Trainer",
    });

    // ================= FETCH TRAINERS =================
    const fetchTrainers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/trainers?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${searchTerm}`
        );
        setTrainers(res.data.trainers || []);
        setTotalTrainers(res.data.total || 0);
      } catch (err) {
        console.error("Error fetching trainers:", err);
        toast.error("Failed to load trainers");
      }
    };

    useEffect(() => {
      fetchTrainers();
    }, [currentPage, searchTerm]);

    // ================= MODAL HANDLERS =================
    const openModal = (type, trainer = null) => {
      setModalType(type);
      setSelectedTrainer(trainer);

      if (type === "edit" && trainer) {
        setFormData({
          name: trainer.name || "",
          email: trainer.email || "",
          phone: trainer.phone || "",
          status: trainer.status || "Active",
          workout: trainer.workout || "",
          avatar: trainer.avatar || "",
          img: trainer.img || null, // keep URL as string
          bio: trainer.bio || "",
          specialties: Array.isArray(trainer.specialties) ? trainer.specialties : [],
          role: trainer.role || "Trainer",
        });
        setImagePreview(trainer.img || "");
      } else if (type === "add") {
        setFormData({
          name: "",
          email: "",
          phone: "",
          status: "Active",
          workout: "",
          avatar: "",
          img: null,
          bio: "",
          specialties: [],
          role: "Trainer",
        });
        setImagePreview("");
      }

      setModalOpen(true);
    };

    const closeModal = () => {
      setModalOpen(false);
      setSelectedTrainer(null);
      setImagePreview("");
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFormData((prev) => ({ ...prev, img: file }));
        setImagePreview(URL.createObjectURL(file));
      }
    };

    // ================= CRUD HANDLERS =================
    const handleFormSubmit = async (e) => {
      e.preventDefault();

      const data = new FormData();

      // Required fields - always append
      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim());

      // Optional fields
      data.append("phone", (formData.phone || "").trim());
      data.append("status", formData.status);
      data.append("workout", formData.workout || "");
      data.append("avatar", (formData.avatar || "").slice(0, 1).toUpperCase());
      data.append("bio", formData.bio || "");
      data.append("role", formData.role);

      // Specialties: send as comma-separated string
      const specialtiesStr = Array.isArray(formData.specialties)
        ? formData.specialties.map(s => s.trim()).filter(Boolean).join(",")
        : "";
      data.append("specialties", specialtiesStr);

      // Image: only send if it's a new File
      if (formData.img && formData.img instanceof File) {
        data.append("img", formData.img, formData.img.name);
      } else if (modalType === "edit" && selectedTrainer?.img) {
        // Preserve existing image
        data.append("img", selectedTrainer.img);
      }

      try {
        if (modalType === "add") {
          await axios.post("http://localhost:5000/api/trainers", data, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Trainer added successfully!");
        } else if (modalType === "edit" && selectedTrainer) {
          await axios.put(
            `http://localhost:5000/api/trainers/${selectedTrainer._id}`,
            data,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          toast.success("Trainer updated successfully!");
        }

        fetchTrainers();
        closeModal();
      } catch (err) {
        console.error("Submit error:", err.response?.data || err);
        const msg = err.response?.data?.message || "Operation failed";
        toast.error(msg);
      }
    };

    const handleDelete = async (id) => {
      if (!window.confirm("Delete this trainer permanently?")) return;
      try {
        await axios.delete(`http://localhost:5000/api/trainers/${id}`);
        toast.success("Trainer deleted");
        fetchTrainers();
      } catch (err) {
        toast.error("Delete failed");
      }
    };

    const handleStatusToggle = async (trainer) => {
    const newStatus = trainer.status === "Active" ? "Inactive" : "Active";

    // 1. Update local trainers immediately
    setTrainers((prev) =>
      prev.map((t) =>
        t._id === trainer._id ? { ...t, status: newStatus } : t
      )
    );

    // 2. Remove from filtered list if current filter hides this status
    if (filterStatus !== "All" && newStatus !== filterStatus) {
      setTrainers((prev) => prev.filter((t) => t._id !== trainer._id));
    }

    try {
      // 3. Update server
      await axios.patch(
        `http://localhost:5000/api/trainers/${trainer._id}/status`,
        { status: newStatus }
      );
      toast.success("Status updated");
    } catch (err) {
      // 4. Revert on error
      setTrainers((prev) =>
        prev.map((t) =>
          t._id === trainer._id ? { ...t, status: trainer.status } : t
        )
      );
      toast.error("Failed to update status");
    }
  };

    // ================= FILTER & PAGINATION =================
    const filteredTrainers = useMemo(() => {
      return trainers.filter((t) => filterStatus === "All" || t.status === filterStatus);
    }, [trainers, filterStatus]);

    const totalPages = Math.max(1, Math.ceil(totalTrainers / ITEMS_PER_PAGE));

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (!e.target.closest("#statusDropdown") && !e.target.closest("#statusDropdownButton"))
          setStatusDropdownOpen(false);
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
      <div className="p-6 bg-white rounded-xl">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Trainers</h1>
            <p className="text-gray-500">Manage trainers and assign workouts</p>
          </div>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 bg-[#e3002a] hover:bg-[#c90024] text-white px-5 py-3 rounded-xl transition"
          >
            <UserPlus size={18} /> Add Trainer
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e3002a]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="relative w-44">
            <button
              id="statusDropdownButton"
              className="w-full px-4 py-3 border bg-white rounded-xl flex justify-between items-center"
              onClick={() => setStatusDropdownOpen((s) => !s)}
            >
              {filterStatus} <ChevronDown size={18} />
            </button>
            {statusDropdownOpen && (
              <div id="statusDropdown" className="absolute w-full bg-white shadow-lg rounded-xl border mt-1 z-20">
                {["All", "Active", "Pending", "Inactive"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilterStatus(s);
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="border rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#e3002a] text-white text-left">
                <th className="px-6 py-4">Trainer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Workout</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No trainers found.
                  </td>
                </tr>
              ) : (
                filteredTrainers.map((t) => (
                  <tr key={t._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-5 flex items-center gap-3">
                      {t.img ? (
                        <img src={t.img} alt={t.name} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#e3002a] text-white flex items-center justify-center text-lg font-bold">
                          {t.avatar || t.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-xs text-gray-500">ID #{t._id.slice(-4)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm">{t.email}</div>
                      <div className="text-sm text-gray-500">{t.phone || "-"}</div>
                    </td>
                    <td className="px-6 py-5">{t.workout || "Not assigned"}</td>
                    <td className="px-6 py-5">
                      <StatusToggle status={t.status} onToggle={() => handleStatusToggle(t)} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal("edit", t)} className="p-2 hover:bg-gray-200 rounded-lg"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(t._id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18} className="text-red-600" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center text-sm">
            <p className="text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalTrainers)} of {totalTrainers}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? "bg-[#e3002a] text-white" : "border hover:bg-gray-200"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

        {/* MODAL - ADD / EDIT */}
        {modalOpen && (modalType === "add" || modalType === "edit") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <button className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full" onClick={closeModal}>
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-6">
                {modalType === "add" ? "Add New Trainer" : "Edit Trainer"}
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#e3002a] focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#e3002a]"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl"
                    placeholder="+1234567890"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Workout */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Workout</label>
                  <input
                    type="text"
                    value={formData.workout}
                    onChange={(e) => setFormData({ ...formData, workout: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl"
                    placeholder="e.g. HIIT, Yoga"
                  />
                </div>

                {/* Avatar Letter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Avatar Letter</label>
                  <input
                    type="text"
                    maxLength={1}
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border rounded-xl"
                    placeholder="J"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-xl"
                    placeholder="Short description..."
                  />
                </div>

                {/* Specialties */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Specialties</label>
                  <input
                    type="text"
                    value={Array.isArray(formData.specialties) ? formData.specialties.join(", ") : ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialties: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-4 py-3 border rounded-xl"
                    placeholder="Weight Loss, Yoga, Strength Training"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Profile Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full" />
                  {imagePreview && (
                    <div className="mt-3">
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border" />
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 border rounded-xl hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#e3002a] hover:bg-[#c90024] text-white rounded-xl transition"
                  >
                    {modalType === "add" ? "Add Trainer" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }