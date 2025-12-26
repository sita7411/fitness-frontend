import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  User,
  Star,
  Dumbbell,
  HeartPulse,
  Flame,
  Timer,
  Save,
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserAuth } from "../context/AuthContext";

export default function ProfileDashboard() {
  const accent = "#E3002A";
  const backendURL = "http://localhost:5000";

  const { user: authUser } = useUserAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    accountAlerts: true,
  });

  const [membership, setMembership] = useState({
    plan: "No Plan",
    startDate: null,
    endDate: null,
  });

  const tabs = [
    { key: "profile", label: "Profile Info", icon: <User size={18} /> },
    { key: "password", label: "Change Password", icon: <Lock size={18} /> },
    { key: "preferences", label: "Preferences", icon: <Star size={18} /> },
    { key: "membership", label: "Membership Info", icon: <Star size={18} /> },
  ];

  // Load user data on authUser change
  useEffect(() => {
    if (!authUser) return;

    setFullName(authUser.name || "");
    setEmail(authUser.email || "");
    setPhone(authUser.phone || "");
    setGender(authUser.gender || "");
    setDob(authUser.dob ? new Date(authUser.dob).toISOString().split("T")[0] : "");
    setAddress(authUser.address || "");
    setAvatarPreview(authUser.avatar || null);

    setPreferences({
      emailNotifications: authUser.emailNotifications ?? true,
      smsNotifications: authUser.smsNotifications ?? false,
      accountAlerts: authUser.accountAlerts ?? true,
    });

    // FIXED: Correctly read membership from authUser
    const mem = authUser.membership || authUser.membershipDetails || {};
    setMembership({
      plan: mem.plan || "No Plan",
      startDate: mem.startedAt ? new Date(mem.startedAt) : null,
      endDate: mem.expiresAt ? new Date(mem.expiresAt) : null,
    });
  }, [authUser]);

  // Save Profile
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("gender", gender);
      formData.append("dob", dob);
      formData.append("address", address);
      if (avatarFile) formData.append("avatar", avatarFile);

      // FIXED URL HERE
      const res = await axios.put(`${backendURL}/api/auth/me`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data?.message || "Profile updated successfully!");
      if (avatarFile) {
        setAvatarPreview(URL.createObjectURL(avatarFile));
        setAvatarFile(null);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordCurrent || !passwordNew) {
      return toast.error("Both password fields are required");
    }
    if (passwordNew.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    try {
      setIsLoading(true);
      const res = await axios.put(
        `${backendURL}/api/auth/password`, 
        { currentPassword: passwordCurrent, newPassword: passwordNew },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Password updated successfully!");
      setPasswordCurrent("");
      setPasswordNew("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  // Save preferences
  const handleSavePreferences = async () => {
    try {
      setIsLoading(true);
      const res = await axios.put(`${backendURL}/api/users/preferences`, preferences, {
        withCredentials: true,
      });
      toast.success(res.data?.message || "Preferences saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
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

      <div className="min-h-screen bg-gray-50">
        {/* HERO – unchanged */}
        <section className="relative w-full h-[300px] md:h-[400px] text-white text-center flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=1400&q=80"
              alt="Gym Banner"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#E3002A]/60 to-black/90" />
          </div>

          <motion.div className="absolute inset-0 z-10 pointer-events-none">
            {[
              { icon: <Dumbbell size={42} />, x: "8%", y: "20%", delay: 0 },
              { icon: <HeartPulse size={36} />, x: "82%", y: "35%", delay: 1 },
              { icon: <Flame size={32} />, x: "18%", y: "68%", delay: 1.5 },
              { icon: <Timer size={34} />, x: "62%", y: "58%", delay: 2 },
              { icon: <Star size={30} />, x: "75%", y: "18%", delay: 2.5 },
            ].map((item, i) => (
              <motion.div
                key={i}
                style={{ position: "absolute", left: item.x, top: item.y }}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: [0, -12, 0] }}
                transition={{ duration: 4, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
                className="text-white/80 drop-shadow-2xl"
              >
                {item.icon}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-20 px-6"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-3 drop-shadow-2xl">
              Hi, {fullName || "Member"}!
            </h1>
            <p className="text-lg md:text-xl text-gray-200">
              Manage your account, preferences, and membership
            </p>
          </motion.div>
        </section>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-10">
          {/* SIDEBAR */}
          <aside className="lg:w-72">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <nav className="p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg text-left font-medium transition-all duration-200
                      ${activeTab === tab.key
                        ? "bg-red-50 text-red-600 border-l-4 border-red-600 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                      }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* MAIN PANEL */}
          <main className="flex-1 space-y-8">
            {isLoading && (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent"></div>
              </div>
            )}

            {/* Profile Info */}
            {activeTab === "profile" && (
              <Card title="Profile Information">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <img
                      src={avatarFile ? URL.createObjectURL(avatarFile) : avatarPreview || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80"}
                      alt="Profile"
                      className="w-36 h-36 rounded-full object-cover border-8 border-white shadow-2xl"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                      <span className="text-white font-medium">Change</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatarFile(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Full Name" value={fullName} onChange={setFullName} />
                  <Input label="Email" type="email" value={email} onChange={setEmail} />
                  <Input label="Phone" value={phone} onChange={setPhone} />
                  <div>
                    <label className="text-sm text-gray-600">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <Input label="Date of Birth" type="date" value={dob} onChange={setDob} />
                  <Input label="Address" value={address} onChange={setAddress} />
                </div>

                <div className="flex justify-end mt-8">
                  <PrimaryBtn
                    label={isLoading ? "Saving..." : "Save Changes"}
                    accent={accent}
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                  />
                </div>
              </Card>
            )}

            {/* Change Password */}
            {activeTab === "password" && (
              <Card title="Change Password">
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordCurrent}
                    onChange={setPasswordCurrent}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordNew}
                    onChange={setPasswordNew}
                  />
                </div>
                <div className="flex justify-end mt-8">
                  <PrimaryBtn
                    label={isLoading ? "Updating..." : "Update Password"}
                    accent={accent}
                    onClick={handleUpdatePassword}
                    disabled={isLoading}
                  />
                </div>
              </Card>
            )}

            {/* Preferences */}
            {activeTab === "preferences" && (
              <Card title="Notification Preferences">
                <div className="space-y-5 max-w-lg">
                  <Checkbox
                    label="Email Notifications"
                    checked={preferences.emailNotifications}
                    onChange={() => handlePreferenceChange("emailNotifications")}
                  />
                  <Checkbox
                    label="SMS Notifications"
                    checked={preferences.smsNotifications}
                    onChange={() => handlePreferenceChange("smsNotifications")}
                  />
                  <Checkbox
                    label="Account Activity Alerts"
                    checked={preferences.accountAlerts}
                    onChange={() => handlePreferenceChange("accountAlerts")}
                  />
                </div>
                <div className="flex justify-end mt-10">
                  <PrimaryBtn
                    label={isLoading ? "Saving..." : "Save Preferences"}
                    accent={accent}
                    icon={<Save size={16} className="ml-2" />}
                    onClick={handleSavePreferences}
                    disabled={isLoading}
                  />
                </div>
              </Card>
            )}

            {/* Membership – NOW WORKS CORRECTLY */}
            {activeTab === "membership" && (
              <Card title="Membership Details">
                <div className="space-y-4 text-lg">
                  <div className="flex justify-between py-4 border-b">
                    <span className="text-gray-600">Current Plan</span>
                    <span className="font-bold text-red-600">{membership.plan}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-medium">
                      {membership.startDate ? membership.startDate.toLocaleDateString() : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span className="text-gray-600">End Date</span>
                    <span className="font-medium">
                      {membership.endDate ? membership.endDate.toLocaleDateString() : "-"}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

/* Reusable Components – unchanged */
function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300">
      <h3 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">{title}</h3>
      {children}
    </div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
        placeholder={label}
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-4 cursor-pointer text-gray-700 hover:text-red-600 transition">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 accent-red-600 rounded focus:ring-red-500"
      />
      <span className="text-lg">{label}</span>
    </label>
  );
}

function PrimaryBtn({ label, accent, onClick, disabled, icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ backgroundColor: disabled ? "#ccc" : accent }}
      className="px-8 py-3.5 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {label}
      {icon}
    </button>
  );
}