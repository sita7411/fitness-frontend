import React, { useState } from "react";
import { Mail, Phone, MapPin, Users, Star, HeartPulse } from "lucide-react";

/* Options for dropdown */
const iconOptions = [
  { name: "Mail", component: Mail },
  { name: "Phone", component: Phone },
  { name: "MapPin", component: MapPin },
  { name: "Users", component: Users },
  { name: "Star", component: Star },
  { name: "HeartPulse", component: HeartPulse },
];

/* -----------------------------------
      PROFESSIONAL DROPDOWN COMPONENT
-------------------------------------*/
function Dropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.name === value);

  return (
    <div className="relative w-full md:w-48">
      {/* Selected Box */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-4 py-2 gap-8 bg-white border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:border-gray-400 transition"
      >
        <div className="flex items-center gap-2">
          {selected?.component && (
            <selected.component size={18} className="text-gray-700" />
          )}
          <span className="text-gray-700 font-medium">{selected?.name}</span>
        </div>

        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute left-0 z-20 mt-2 w-full bg-white shadow-lg border border-gray-200 rounded-lg py-1 animate-fadeIn">
          {options.map((opt, idx) => (
            <div
              key={idx}
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

/* -----------------------------------
         MAIN ADMIN SETTINGS PAGE
-------------------------------------*/
export default function AdminSettingsProfessional() {
  const [logo, setLogo] = useState(null);
  const [address, setAddress] = useState("123 Fitness Street, Wellness City");
  const [phone, setPhone] = useState("+123 456 7890");
  const [email, setEmail] = useState("support@fitnessapp.com");
  const [mapEmbed, setMapEmbed] = useState("");

  const [floatingIcons, setFloatingIcons] = useState([
    { icon: "Mail", x: "10%", y: "30%", delay: 0 },
    { icon: "Phone", x: "85%", y: "40%", delay: 1 },
    { icon: "MapPin", x: "20%", y: "70%", delay: 1.5 },
  ]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setLogo(URL.createObjectURL(file));
  };

  const updateIcon = (index, field, value) => {
    const updated = [...floatingIcons];
    updated[index][field] = value;
    setFloatingIcons(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Settings saved!");
  };

  return (
    <div className="min-h-screen bg-white rounded-lg py-12 px-6 md:px-10">
      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-12">Settings</h1>

      {/* Glass Card */}
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
        <form onSubmit={handleSubmit} className="flex flex-col gap-12">
          
          {/* Logo Upload */}
          <div className="flex flex-col items-start gap-3">
            <label className="text-xl font-semibold text-gray-900">Logo</label>

            <div className="w-40 h-40 bg-gray-100 rounded-xl shadow-inner flex items-center justify-center overflow-hidden border border-gray-300">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
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
            <label className="text-xl font-semibold text-gray-900">
              Contact Information
            </label>

            <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Textarea label="Map Embed URL" value={mapEmbed} onChange={(e) => setMapEmbed(e.target.value)} rows={3} />
          </div>

          {/* Floating Icons */}
          <div className="flex flex-col gap-6">
            <label className="text-xl font-semibold text-gray-900">Floating Icons</label>

            <div className="grid grid-cols-1 gap-6">
              {floatingIcons.map((icon, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center"
                >
                  {/* Professional Dropdown */}
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
                    onChange={(e) => updateIcon(idx, "delay", parseFloat(e.target.value))}
                    placeholder="1.5"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="bg-[#e3002a] hover:bg-[#c10025] text-white font-semibold py-3 px-8 rounded-lg shadow-md w-fit transition"
          >
            Save Settings
          </button>

        </form>
      </div>
    </div>
  );
}

/* Reusable Input Component */
function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="w-full">
      <label className="block text-gray-700 mb-1 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#e3002a] focus:border-[#e3002a] transition bg-white shadow-inner"
      />
    </div>
  );
}

/* Reusable Textarea */
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
