import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  User, Mail, Phone, Calendar, Ruler, Weight,
  HeartPulse, BadgeCheck, Target, Utensils, AlertCircle,
  Dumbbell, Camera, Edit3, Home
} from "lucide-react";
import { useUserAuth } from "../../context/AuthContext";
export default function MyProfile() {
  const { logout } = useUserAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // -----------------------------
  // FETCH LOGGED-IN USER DETAILS
  // -----------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
        });

        if (res.data.loggedIn) {
          setUser(JSON.parse(JSON.stringify(res.data.user)));
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [logout]);

  // -----------------------------
  // UPDATE PROFILE FUNCTION
  // -----------------------------
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const formData = new FormData(e.target);
    const payload = {};

    // --- BASIC INFO ---
    const fields = ["name", "email", "phone", "gender", "dob", "address"];
    fields.forEach((field) => {
      const value = formData.get(field)?.trim();
      if (value && value !== user?.[field]) {
        payload[field] = value;
      }
    });

    // --- HEALTH METRICS ---
    const healthMetrics = {};
    const healthFields = ["height", "weight", "bodyFat", "medicalConditions"];

    healthFields.forEach((field) => {
      const value = formData.get(field);
      if (value !== "" && value !== user?.healthMetrics?.[field]) {
        healthMetrics[field] =
          field === "medicalConditions" ? value.trim() : Number(value);
      }
    });

    if (Object.keys(healthMetrics).length) {
      payload.healthMetrics = healthMetrics;
    }

    // --- FITNESS PREFERENCES ---
    const fitness = {};
    const fitFields = ["goal", "workoutType", "diet", "allergies"];

    fitFields.forEach((field) => {
      const value = formData.get(field)?.trim();
      if (value && value !== user?.fitnessPreferences?.[field]) {
        fitness[field] = value;
      }
    });

    if (Object.keys(fitness).length) {
      payload.fitnessPreferences = fitness;
    }

    // --- TRAINER INFO ---
    const trainer = {};
    const trainerFields = ["trainerName", "trainerEmail", "trainerSessionsLeft"];

    trainerFields.forEach((field) => {
      const key = field.replace("trainer", "").replace("Email", "email").replace("Name", "name").replace("SessionsLeft", "sessionsLeft");
      const value = formData.get(field)?.trim();

      if (value !== "" && value !== user?.trainer?.[key]) {
        trainer[key] = key === "sessionsLeft" ? Number(value) : value;
      }
    });

    if (Object.keys(trainer).length) {
      payload.trainer = trainer;
    }

    // Nothing changed
    if (Object.keys(payload).length === 0) {
      toast.info("No changes detected");
      setUpdating(false);
      return;
    }

    try {
      const res = await axios.put("http://localhost:5000/api/auth/me", payload, {
        withCredentials: true,
      });

      setUser(res.data.user);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  // -----------------------------
  // LOADING UI
  // -----------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Please log in to view your profile.</p>
      </div>
    );
  }

  // -----------------------------
  // MAIN UI
  // -----------------------------


  return (
    <div className="min-h-screen bg-white rounded-lg py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* PROFILE HEADER */}
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-center gap-10">

            {/* PROFILE PHOTO */}
            <div className="relative">
              <img
                src={user.avatar || "/profile.jpg"}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl"
              />
              <label className="absolute bottom-2  right-3 bg-red-600 p-2 rounded-full cursor-pointer text-white shadow-lg">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>

            {/* DETAILS */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900">{user.name}</h1>

              {/* MEMBERSHIP STATUS */}
              <div className="mt-4 flex flex-col text-[#E3002a] lg:flex-row items-center lg:items-start gap-2">
                <BadgeCheck size={18} className="mt-1" />

                {user.membership?.plan ? (
                  <MembershipStatus
                    plan={user.membership.plan}
                    expiresAt={user.membership.expiresAt}
                  />
                ) : (
                  <span className="text-gray-500 font-medium">Standard Member</span>
                )}
              </div>

              {/* CONTACT & INFO */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ProfileMini icon={Mail} label={user.email} />
                <ProfileMini icon={Phone} label={user.phone} />
                <ProfileMini icon={Calendar} label={user.joined || "Recent"} />
              </div>
            </div>
          </div>
        </div>


        {/* PROFILE FORM */}
        <form className="space-y-10" onSubmit={handleUpdateProfile}>

          <ProfileSection title="Personal Information" icon={User}>
            <TwoCol>
              <InfoField label="Full Name" name="name" value={user.name} icon={User} required />
              <InfoField label="Email" name="email" value={user.email} icon={Mail} type="email" required />
              <InfoField label="Phone" name="phone" value={user.phone} icon={Phone} />
              <InfoField label="Gender" name="gender" value={user.gender} icon={User} type="select" options={["Male", "Female", "Other"]} />
              <InfoField label="Date of Birth" name="dob" type="date" value={user.dob ? new Date(user.dob).toISOString().split("T")[0] : ""} icon={Calendar} />
              <InfoField label="Address" name="address" value={user.address || ""} icon={Home} />
            </TwoCol>
          </ProfileSection>

          <ProfileSection title="Health Metrics" icon={HeartPulse}>
            <TwoCol>
              <InfoField label="Height (cm)" name="height" value={user.healthMetrics?.height || ""} icon={Ruler} type="number" />
              <InfoField label="Weight (kg)" name="weight" value={user.healthMetrics?.weight || ""} icon={Weight} type="number" />
              <InfoField label="BMI" name="bmi" value={user.healthMetrics?.bmi || ""} icon={HeartPulse} disabled />
              <InfoField label="Body Fat %" name="bodyFat" value={user.healthMetrics?.bodyFat || ""} icon={Target} type="number" />
              <InfoField label="Medical Conditions" name="medicalConditions" value={user.healthMetrics?.medicalConditions || ""} icon={AlertCircle} type="textarea" />
            </TwoCol>
          </ProfileSection>

          <ProfileSection title="Fitness Preferences" icon={Target}>
            <TwoCol>
              <InfoField label="Fitness Goal" name="goal" value={user.fitnessPreferences?.goal} icon={Target} type="select" options={["Weight Loss", "Muscle Gain", "General Fitness"]} />
              <InfoField label="Preferred Workout" name="workoutType" value={user.fitnessPreferences?.workoutType} icon={Dumbbell} type="select" options={["Cardio", "Strength", "HIIT", "Yoga"]} />
              <InfoField label="Diet Preference" name="diet" value={user.fitnessPreferences?.diet} icon={Utensils} type="select" options={["Vegan", "Vegetarian", "Keto", "Balanced"]} />
              <InfoField label="Allergies" name="allergies" value={user.fitnessPreferences?.allergies} icon={AlertCircle} type="text" />
            </TwoCol>
          </ProfileSection>



          <button
            type="submit"
            disabled={updating}
            className="w-full lg:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold shadow-md transition disabled:opacity-50"
          >
            {updating ? "Updating..." : "Update My Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

// --------------------------------------------------
// REUSABLE UI COMPONENTS
// --------------------------------------------------

function TwoCol({ children }) {
  return <div className="grid md:grid-cols-2 gap-8">{children}</div>;
}

function ProfileMini({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
      <div className="p-2 bg-red-100 rounded-lg">
        <Icon size={18} className="text-red-600" />
      </div>
      <span className="font-medium truncate text-gray-800">{label}</span>
    </div>
  );
}

function ProfileSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-600 rounded-xl">
          <Icon size={22} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}
const MembershipStatus = ({ plan, expiresAt }) => {
  // If no expiresAt, render only the plan name
  if (!plan || !expiresAt) {
    return <span className="font-semibold text-gray-800">{plan || "Standard Member"}</span>;
  }

  const now = new Date();
  const expiryDate = new Date(expiresAt);
  const isActive = expiryDate > now;
  const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
      {/* Plan Name */}
      <span className="font-semibold text-gray-800">{plan}</span>

      {isActive ? (
        <>
          <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
            ✅ Active
          </span>
          <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            {daysLeft} day{daysLeft > 1 ? "s" : ""} left
          </span>
          <span className="text-xs text-gray-500">
            Expires {expiryDate.toLocaleDateString("en-IN")}
          </span>
        </>
      ) : (
        <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
          ❌ Expired
        </span>
      )}
    </div>
  );
};

function InfoField({ label, value, icon: Icon, name, type = "text", options = [], disabled = false }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
        <Icon size={16} className="text-red-600" />
        {label}
      </label>

      {type === "select" ? (
        <select
          name={name}
          defaultValue={value || ""}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          rows={3}
          defaultValue={value || ""}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={value || ""}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        />
      )}
    </div>
  );
}
