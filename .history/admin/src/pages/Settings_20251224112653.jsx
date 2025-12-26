// src/pages/AdminSettings.jsx (or AdminSettingsProfessional.jsx)

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Mail,
  Phone,
  MapPin,
  Users,
  Star,
  HeartPulse,
} from "lucide-react";

const iconOptions = [
  { name: "Mail", component: Mail },
  { name: "Phone", component: Phone },
  { name: "MapPin", component: MapPin },
  { name: "Users", component: Users },
  { name: "Star", component: Star },
  { name: "HeartPulse", component: HeartPulse },
];

// Reusable Dropdown for Icon Selection
function Dropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.name === value);

  return (
    <div className="relative w-full md:w-56">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:border-gray-400 transition"
      >
        <div className="flex items-center gap-3">
          {selected?.component && <selected.component size={20} className="text-gray-700" />}
          <span className="font-medium text-gray-800">{selected?.name || "Select Icon"}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
          {options.map((opt) => (
            <div
              key={opt.name}
              onClick={() => {
                onChange(opt.name);
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition"
            >
              <opt.component size={20} className="text-gray-700" />
              <span className="text-gray-700">{opt.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSettings() {
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mapEmbed, setMapEmbed] = useState("");
  const [floatingIcons, setFloatingIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();

        setAddress(data.address || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setMapEmbed(data.mapEmbed || "");
        setFloatingIcons(data.floatingIcons || []);
        if (data.logo) setLogoPreview(data.logo);
      } catch (err) {
        toast.error("Failed to load settings. Using defaults.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      toast.info("New logo selected – save to upload!");
    }
  };

  const updateIcon = (index, field, value) => {
    const updated = [...floatingIcons];
    updated[index][field] = value;
    setFloatingIcons(updated);
  };

  const addNewIcon = () => {
    setFloatingIcons([
      ...floatingIcons,
      { icon: "Mail", x: "50%", y: "50%", delay: 0 },
    ]);
    toast.success("New floating icon added!");
  };

  const removeIcon = (index) => {
    setFloatingIcons(floatingIcons.filter((_, i) => i !== index));
    toast.warn("Floating icon removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const formData = new FormData();
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("mapEmbed", mapEmbed);
    formData.append("floatingIcons", JSON.stringify(floatingIcons));

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    try {
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "POST",
        body: formData,
        // No Content-Type header needed for FormData
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("✅ All settings saved successfully!");

        // Update logo preview from Cloudinary if uploaded
        if (result.settings?.logo) {
          setLogoPreview(result.settings.logo);
          setLogoFile(null); // clear file after upload
        }
      } else {
        toast.error(result.message || "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error! Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} theme="light" />

      <div className="min-h-screen bg-gray-50 py-12 px-6 lg:px-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-10">Admin Settings</h1>

        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-12">

            {/* Logo Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Website Logo</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-64 h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Current Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-gray-500 text-lg">No logo uploaded</span>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-block px-8 py-4 bg-[#e3002a] hover:bg-[#c10025] text-white font-semibold rounded-xl shadow-lg transition transform hover:scale-105">
                    Upload New Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                  <p className="text-sm text-gray-600 mt-3">Recommended: 500x500 PNG or JPG</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <div className="md:col-span-2">
                  <Textarea
                    label="Google Map Embed URL (iframe src)"
                    value={mapEmbed}
                    onChange={(e) => setMapEmbed(e.target.value)}
                    rows={4}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>
              </div>
            </div>

            {/* Floating Icons Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Floating Icons (Hero Banner)</h2>
                <button
                  type="button"
                  onClick={addNewIcon}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Icon
                </button>
              </div>

              {floatingIcons.length === 0 && (
                <p className="text-gray-500 italic py-8 text-center">No floating icons yet. Click "Add New Icon" to start!</p>
              )}

              <div className="space-y-6">
                {floatingIcons.map((icon, idx) => (
                  <div
                    key={idx}
                    className="relative bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => removeIcon(idx)}
                      className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition"
                      title="Remove icon"
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Dropdown value={icon.icon} onChange={(val) => updateIcon(idx, "icon", val)} options={iconOptions} />
                      <Input label="X Position (%)" value={icon.x} onChange={(e) => updateIcon(idx, "x", e.target.value)} placeholder="e.g. 10%" />
                      <Input label="Y Position (%)" value={icon.y} onChange={(e) => updateIcon(idx, "y", e.target.value)} placeholder="e.g. 30%" />
                      <Input
                        label="Delay (seconds)"
                        type="number"
                        step="0.1"
                        value={icon.delay}
                        onChange={(e) => updateIcon(idx, "delay", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="px-12 py-5 bg-[#e3002a] hover:bg-[#c10025] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xl font-bold rounded-xl shadow-xl transition transform hover:scale-105"
              >
                {saving ? "Saving Changes..." : "Save All Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Reusable Input & Textarea
function Input({ label, value, onChange, placeholder, type = "text", step }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-red-200 focus:border-[#e3002a] transition shadow-sm"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-red-200 focus:border-[#e3002a] transition shadow-sm resize-none"
      />
    </div>
  );
}