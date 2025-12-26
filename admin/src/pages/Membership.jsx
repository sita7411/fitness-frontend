import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckIcon, Trash2, Edit, PlusIcon, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:5000/api/memberships";

const MembershipsPage = () => {
  const [memberships, setMemberships] = useState([]);
  const [tab, setTab] = useState("all");
  const [editingMembership, setEditingMembership] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    features: [""],
    popular: false,
    plans: [], 
  });

  // Fetch memberships
  const fetchMemberships = async () => {
    try {
      const res = await axios.get(API_BASE);
      setMemberships(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch memberships");
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const handleChange = (e, index) => {
    const { name, value, checked } = e.target;
    if (name === "popular") setForm({ ...form, popular: checked });
    else if (name === "features") {
      const newFeatures = [...form.features];
      newFeatures[index] = value;
      setForm({ ...form, features: newFeatures });
    } else setForm({ ...form, [name]: value });
  };

  const addFeature = () => setForm({ ...form, features: [...form.features, ""] });
  const removeFeature = (index) => setForm({ ...form, features: form.features.filter((_, i) => i !== index) });

  const handleEdit = (membership) => {
    setEditingMembership(membership);
    setForm({
      name: membership.name,
      price: membership.price,
      duration: membership.duration,
      features: membership.features.length ? membership.features : [""],
      popular: membership.popular,
      plans: membership.plans || [], 
    });
    setTab("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        duration: form.duration.trim(),
        features: form.features.filter((f) => f.trim() !== ""),
        popular: form.popular,
        plans: form.plans, 
      };

      if (editingMembership) {
        await axios.put(`${API_BASE}/${editingMembership._id}`, payload);
        toast.success("Membership updated successfully!");
      } else {
        await axios.post(API_BASE, payload);
        toast.success("Membership created successfully!");
      }

      fetchMemberships();
      setTab("all");
      setEditingMembership(null);
      setForm({ name: "", price: "", duration: "", features: [""], popular: false, plans: [] });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this membership?")) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchMemberships();
      toast.success("Membership deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete membership");
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen rounded-lg font-sans">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="dark"
        toastStyle={{
          backgroundColor: "#1E1E1E",
          color: "#fff",
          borderLeft: "6px solid #E3002A",
          fontFamily: "Poppins, sans-serif",
        }}
      />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Memberships Management</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-6 py-2 rounded-lg font-semibold transition ${tab === "all" ? "bg-[#e3002a] text-white shadow-md" : "bg-white text-gray-700 hover:shadow"
            }`}
          onClick={() => {
            setTab("all");
            setEditingMembership(null);
          }}
        >
          All Memberships
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-semibold transition ${tab === "form" ? "bg-[#e3002a] text-white shadow-md" : "bg-white text-gray-700 hover:shadow"
            }`}
          onClick={() => {
            setTab("form");
            setEditingMembership(null);
            setForm({ name: "", price: "", duration: "", features: [""], popular: false, plans: [] });
          }}
        >
          {editingMembership ? "Edit Membership" : "Create Membership"}
        </button>
      </div>

      {/* Table */}
      {tab === "all" && (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#e3002a] text-white text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Plans</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Features</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center">Popular</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {memberships.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No memberships found.
                    </td>
                  </tr>
                )}
                {memberships.map((m, i) => (
                  <tr key={m._id} className={`border-b ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-colors`}>
                    <td className="px-6 py-4 text-gray-900 font-medium">{m.name}</td>
                    <td className="px-6 py-4 text-gray-900">₹{m.price}</td>
                    <td className="px-6 py-4 text-gray-900">{m.duration}</td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {m.plans && m.plans.length > 0 ? m.plans.join(", ") : "No Plans"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <ul className="list-disc list-inside max-w-xs">
                        {m.features.slice(0, 3).map((f, idx) => (
                          <li key={idx} className="truncate">{f}</li>
                        ))}
                        {m.features.length > 3 && (
                          <li className="text-gray-500">+{m.features.length - 3} more</li>
                        )}
                      </ul>
                    </td>
                    <td className="px-6 py-4 text-center">{m.popular ? <CheckIcon className="w-5 h-5 text-green-600 mx-auto" /> : "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(m)} className="p-2 hover:bg-gray-200 rounded-lg transition">
                          <Edit className="w-5 h-5 text-gray-700" />
                        </button>
                        <button onClick={() => handleDelete(m._id)} className="p-2 hover:bg-red-100 rounded-lg transition">
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form */}
      {tab === "form" && (
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingMembership ? "Edit Membership" : "Create New Membership"}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Basic, Premium, Pro"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e3002a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e3002a] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Duration *</label>
              <input
                type="text"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                required
                placeholder="e.g., 1 Month, 3 Months, 12 Months"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e3002a] focus:border-transparent"
              />
            </div>

            {/* ✅ NEW: PLANS SELECTION SECTION */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <label className="block text-gray-700 font-semibold mb-4 text-lg">🎯 Access to Plans</label>
              <p className="text-sm text-gray-600 mb-4">Select which plans this membership can access:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={form.plans.includes("Basic")} 
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm(prev => ({
                        ...prev,
                        plans: checked 
                          ? [...prev.plans.filter(p => p !== "Basic"), "Basic"]
                          : prev.plans.filter(p => p !== "Basic")
                      }));
                    }} 
                    className="w-5 h-5 text-[#e3002a] border-gray-300 rounded focus:ring-[#e3002a] group-hover:scale-110 transition-transform" 
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Basic</div>
                    <div className="text-sm text-gray-500">Basic workouts</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={form.plans.includes("Premium")} 
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm(prev => ({
                        ...prev,
                        plans: checked 
                          ? [...prev.plans.filter(p => p !== "Premium"), "Premium"]
                          : prev.plans.filter(p => p !== "Premium")
                      }));
                    }} 
                    className="w-5 h-5 text-[#e3002a] border-gray-300 rounded focus:ring-[#e3002a] group-hover:scale-110 transition-transform" 
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Premium</div>
                    <div className="text-sm text-gray-500">Premium + Basic</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={form.plans.includes("Pro")} 
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm(prev => ({
                        ...prev,
                        plans: checked 
                          ? [...prev.plans.filter(p => p !== "Pro"), "Pro"]
                          : prev.plans.filter(p => p !== "Pro")
                      }));
                    }} 
                    className="w-5 h-5 text-[#e3002a] border-gray-300 rounded focus:ring-[#e3002a] group-hover:scale-110 transition-transform" 
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Pro</div>
                    <div className="text-sm text-gray-500">All plans access</div>
                  </div>
                </label>
              </div>
              <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <strong>Current selection:</strong> {form.plans.length > 0 ? form.plans.join(", ") : "No plans selected"}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Features *</label>
              <div className="space-y-3">
                {form.features.map((f, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      name="features"
                      value={f}
                      onChange={(e) => handleChange(e, idx)}
                      placeholder={`Feature ${idx + 1}`}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e3002a] focus:border-transparent"
                    />
                    {form.features.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeFeature(idx)} 
                        className="w-12 h-12 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addFeature} 
                  className="flex items-center gap-2 text-[#e3002a] font-semibold hover:text-red-700 transition-all"
                >
                  <PlusIcon className="w-4 h-4" /> Add Feature
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <input 
                type="checkbox" 
                name="popular" 
                checked={form.popular} 
                onChange={handleChange} 
                className="w-5 h-5 text-[#e3002a] border-yellow-300 rounded focus:ring-[#e3002a]" 
              />
              <label className="text-gray-700 font-semibold">
                ⭐ Make this a Popular Plan (Shows badge on frontend)
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-gradient-to-r from-[#e3002a] to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Saving..." : editingMembership ? "Update Membership" : "Create Membership"}
              </button>
              <button 
                type="button" 
                onClick={() => { setTab("all"); setEditingMembership(null); }} 
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MembershipsPage;