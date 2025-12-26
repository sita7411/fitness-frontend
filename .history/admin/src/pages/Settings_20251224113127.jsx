// src/pages/AdminSettingsProfessional.jsx

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

function Dropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.name === value);

  return (
    <div className="relative w-full md:w-48">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-4 py-2 gap-8 bg-white border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:border-gray-400 transition"
      >
        <div className="flex items-center gap-2">
          {selected?.component && (
            <selected.component size={18} className="text-gray-700" />
          )}
          <span className="text-gray-700 font-medium">{selected?.name || "Select"}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-full bg-white shadow-lg border border-gray-200 rounded-lg py-1">
          {options.map((opt) => (
            <div
              key={opt.name}
              onClick={() => {
                onChange(opt.name);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
            >
              <opt.component size={18} className="text-gray-700" />
              <span className="text-gray-700">{opt.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsProfessional() {
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mapEmbed, setMapEmbed] = useState("");
  const [floatingIcons, setFloatingIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();

        setAddress(data.address || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setMapEmbed(data.mapEmbed || "");
        setFloatingIcons(data.floatingIcons || []);
        if (data.logo) setLogoPreview(data.logo);
      } catch (err) {
        toast.error("Failed to load settings");
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
      toast.info("Logo selected – save to upload");
    }
  };

  const updateIcon = (index, field, value) => {
    const updated = [...floatingIcons];
    updated[index][field] = value;
    setFloatingIcons(updated);
  };

  const addIcon = () => {
    setFloatingIcons([...floatingIcons, { icon: "Mail", x: "10%", y: "30%", delay: 0 }]);
    toast.success("New icon added!");
  };

  const removeIcon = (index) => {
    setFloatingIcons(floatingIcons.filter((_, i) => i !== index));
    toast.warn("Icon removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("mapEmbed", mapEmbed);
    formData.append("floatingIcons", JSON.stringify(floatingIcons));
    if (logoFile) formData.append("logo", logoFile);

    try {
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "POST",
        body: formData,
                withCredentials: true,

      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Settings saved successfully!");
        if (result.settings?.logo) setLogoPreview(result.settings.logo);
        setLogoFile(null);
      } else {
        toast.error(result.message || "Save failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="min-h-screen bg-white rounded-lg py-12 px-6 md:px-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Settings</h1>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-12">

            {/* Logo Upload - Same as original */}
            <div className="flex flex-col items-start gap-3">
              <label className="text-xl font-semibold text-gray-900">Logo</label>
              <div className="w-40 h-40 bg-gray-100 rounded-xl shadow-inner flex items-center justify-center overflow-hidden border border-gray-300">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-gray-400 text-sm">Upload Logo</span>
                )}
              </div>
              <label className="cursor-pointer px-6 py-2 bg-[#e3002a] hover:bg-[#c10025] text-white font-medium rounded-lg transition shadow-sm">
                Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col gap-4">
              <label className="text-xl font-semibold text-gray-900">Contact Information</label>
              <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Textarea label="Map Embed URL" value={mapEmbed} onChange={(e) => setMapEmbed(e.target.value)} rows={3} />
            </div>

            {/* Floating Icons - Now with Add/Remove */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <label className="text-xl font-semibold text-gray-900">Floating Icons</label>
                <button
                  type="button"
                  onClick={addIcon}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition shadow"
                >
                  + Add Icon
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {floatingIcons.map((icon, idx) => (
                  <div
                    key={idx}
                    className="relative bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center"
                  >
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeIcon(idx)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>

                    <Dropdown
                      value={icon.icon}
                      onChange={(val) => updateIcon(idx, "icon", val)}
                      options={iconOptions}
                    />
                    <Input
                      label="X Position"
                      value={icon.x}
                      onChange={(e) => updateIcon(idx, "x", e.target.value)}
                      placeholder="10%"
                    />
                    <Input
                      label="Y Position"
                      value={icon.y}
                      onChange={(e) => updateIcon(idx, "y", e.target.value)}
                      placeholder="40%"
                    />
                    <Input
                      label="Delay (sec)"
                      value={icon.delay}
                      type="number"
                      step="0.1"
                      onChange={(e) => updateIcon(idx, "delay", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>

              {floatingIcons.length === 0 && (
                <p className="text-center text-gray-500 py-6">No floating icons yet. Click "+ Add Icon" to start.</p>
              )}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="bg-[#e3002a] hover:bg-[#c10025] disabled:opacity-70 text-white font-semibold py-3 px-8 rounded-lg shadow-md w-fit transition"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

/* Same Input & Textarea as your original */
function Input({ label, value, onChange, placeholder, type = "text", step }) {
  return (
    <div className="w-full">
      <label className="block text-gray-700 mb-1 font-medium">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#e3002a] focus:border-[#e3002a] transition bg-white shadow-inner"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows }) {
  return (
    <div className="w-full">
      <label className="block text-gray-700 mb-1 font-medium">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#e3002a] focus:border-[#e3002a] transition bg-white shadow-inner resize-none"
      />
    </div>
  );
}