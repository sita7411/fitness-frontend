import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  LogOut,
  Image,
  Key,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiCall = async (endpoint, options = {}) => {
  let fullEndpoint;

  if (endpoint === "/me") {
    if (options.method === "PUT") {
      fullEndpoint = "/me"; 
    } else {
      fullEndpoint = "/admin/me"; 
    }
  } else if (endpoint === "/password") {
    fullEndpoint = "/password"; 
  } else if (endpoint === "/logout") {
    fullEndpoint = "/admin/logout"; 
  } else {
    fullEndpoint = `/admin${endpoint}`;
  }

  const config = {
    method: options.method || "GET",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    },
    credentials: "include",
    ...options,
  };

  const response = await fetch(`${API_BASE}${fullEndpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export default function AdminMyAccount() {
  const [admin, setAdmin] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const navigate = useNavigate();
  const THEME = "#e3002a";

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const response = await apiCall("/me");
      setAdmin(response.user);
      setAvatar(response.user?.avatar || null);
    } catch (err) {
      toast.error("Please login first");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      if (avatarFile) formData.append("avatar", avatarFile);
      formData.append("name", admin.name);
      formData.append("email", admin.email);
      formData.append("phone", admin.phone || "");

      const response = await apiCall("/me", { method: "PUT", body: formData });
      setAdmin(response.user);
      setAvatar(response.user.avatar);
      setAvatarFile(null);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      toast.error("Password must be 6+ characters");
      return;
    }
    setChangingPassword(true);
    try {
      await apiCall("/password", {
        method: "PUT",
        body: JSON.stringify(passwords),
      });
      toast.success("Password updated!");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.message || "Password change failed");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Logout?")) return;
    try {
      await apiCall("/logout", { method: "POST" });
      navigate("/login");
    } catch (err) {
      navigate("/login");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarFile(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Lock className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login as admin</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-theme text-white rounded-lg font-medium hover:bg-theme-dark transition-colors"
            style={{ backgroundColor: THEME }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-lg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Account
          </h1>
          <p className="text-gray-600">Update your profile and password</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <User className="w-5 h-5 text-theme" style={{ color: THEME }} />
              Profile Information
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center space-y-4 mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    <img
                      src={avatarFile ? URL.createObjectURL(avatarFile) : avatar || "/default-avatar.png"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label
                    className="absolute bottom-0 right-0 bg-white shadow-md border border-gray-200 
                    rounded-full p-2 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <Image className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 text-center">Click camera icon to change photo</p>
              </div>

              <InputField
                icon={<User className="w-5 h-5 text-theme" style={{ color: THEME }} />}
                label="Full Name"
                value={admin.name}
                onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                required
              />

              <InputField
                icon={<Mail className="w-5 h-5 text-theme" style={{ color: THEME }} />}
                label="Email"
                type="email"
                value={admin.email}
                onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                required
              />

              <InputField
                icon={<Phone className="w-5 h-5 text-theme" style={{ color: THEME }} />}
                label="Phone"
                value={admin.phone || ""}
                onChange={(e) => setAdmin({ ...admin, phone: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <InputField
                  icon={<Key className="w-5 h-5 text-theme" style={{ color: THEME }} />}
                  label="Role"
                  value={admin.role}
                  disabled
                />
                <InputField
                  icon={<Calendar className="w-5 h-5 text-theme" style={{ color: THEME }} />}
                  label="Joined"
                  value={new Date(admin.createdAt).toLocaleDateString()}
                  disabled
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 px-6 bg-theme text-white rounded-xl font-semibold hover:bg-theme-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: THEME }}
              >
                {updating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Password & Logout */}
          <div className="space-y-8">
            {/* Password Change */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Lock className="w-5 h-5 text-theme" style={{ color: THEME }} />
                Change Password
              </h2>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <PasswordField
                  label="Current Password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  showPassword={showPasswords.current}
                  togglePassword={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                />

                <PasswordField
                  label="New Password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  showPassword={showPasswords.new}
                  togglePassword={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  placeholder="Minimum 6 characters"
                />

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-3 px-6 bg-theme text-white rounded-xl font-semibold hover:bg-theme-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: THEME }}
                >
                  {changingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Changing...
                    </>
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  Update Password
                </button>
              </form>
            </div>

            {/* Logout */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 border border-red-200">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-6 border-2 border-red-500 text-red-600 font-semibold rounded-xl hover:bg-red-50 hover:border-red-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

// Simple Input Component
function InputField({ icon, label, value, onChange, type = "text", disabled = false, required = false }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`flex items-center gap-3 p-4 border rounded-xl transition-all duration-200 ${disabled
        ? "bg-gray-50 border-gray-200"
        : "bg-white border-gray-300 hover:border-gray-400 focus-within:border-theme"
        }`}>
        <span className="text-gray-500 flex-shrink-0">{icon}</span>
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400"
          required={required}
        />
      </div>
    </div>
  );
}

// Simple Password Component
function PasswordField({ label, value, onChange, showPassword, togglePassword, placeholder, required = false }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl bg-white hover:border-gray-400 focus-within:border-theme">
          <Lock className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400 pr-10"
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-4 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}