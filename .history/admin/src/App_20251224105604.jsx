import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext"; // ← IMPORT THIS
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import AllMembers from "./pages/AllMembers";
import MemberDetails from "./pages/MemberDetails";
import TrainerPage from "./pages/TrainerPage";
import AllWorkouts from "./pages/AllWorkouts";
import CreateWorkout from "./pages/CreateWorkout";
import AllClasses from "./pages/AllClasses";
import CreateClasses from "./pages/CreateClasses";
import Schedule from "./pages/Schedule";
import AllPlans from "./pages/AllPlans";
import CreatePlan from "./pages/CreatePlan";
import AllChellenges from "./pages/AllChellenges";
import CreateChallenges from "./pages/CreateChallenges";
import Leaderboard from "./components/Leaderboard";
import Notification from "./pages/Notification";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import MyAccount from "./pages/MyAccount";
import AuthPage from "./pages/AuthPage";
import Membership from "./pages/Membership";


export default function App() {
  return (
    <AdminAuthProvider>

      <Router>
        <Routes>
          {/* All routes under AdminLayout */}
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/allmembers" element={<AllMembers />} />
            <Route path="/member/:id" element={<MemberDetails />} />
            <Route path="/trainers" element={<TrainerPage />} />
            <Route path="/workouts" element={<AllWorkouts />} />
            <Route path="/createworkout" element={<CreateWorkout />} />
            <Route path="/" element={<AssignWorkoutPage />} />
            <Route path="/allclasses" element={<AllClasses />} />
            <Route path="/createclasses" element={<CreateClasses />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/allplans" element={<AllPlans />} />
            <Route path="/createplan" element={<CreatePlan />} />
            <Route path="/allchallenges" element={<AllChellenges />} />
            <Route path="/createchallenges" element={<CreateChallenges />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/notifications" element={<Notification />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/membership" element={<Membership />} />

          </Route>
        </Routes>
      </Router>
    </AdminAuthProvider>

  );
}
