import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserAuth } from "./context/AuthContext";
import { io } from "socket.io-client";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

// Public pages
import Home from "./pages/Home/Home";
import Programs from "./pages/Programs";
import ProgramDetails from "./pages/ProgramDetails";
import Cart from "./Components/Cart/Cart";
import Checkout from "./pages/Checkout";
import EnrollmentSuccess from "./pages/EnrollmentSuccess";
import Trainers from "./pages/Trainers";
import Classes from "./pages/Classes";
import Challenge from "./pages/Challenge";
import Nutrition from "./pages/Nutrition";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ContactUs from "./pages/ContactUs";
import MembershipPage from "./pages/MembershipPage";

// Dashboard pages & layout
import DashboardLayout from "./layout/DashboardLayout";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import DashboardWorkouts from "./pages/Dashboard/DashboardWorkouts";
import DashboardClasses from "./pages/Dashboard/DashboardClasses";
import MyProfile from "./pages/Dashboard/MyProfile";
import NutritionPlans from "./pages/Dashboard/NutritionPlans";
import HealthMetrics from "./pages/Dashboard/HealthMetrics";
import DashboardChellenges from "./pages/Dashboard/DashboardChellenges";
import Notifications from "./pages/Dashboard/Notifications";
import Leaderboard from "./pages/Dashboard/Leaderboard";
import MemberSchedule from "./pages/Dashboard/MemberSchedule";


window.appSocket = socket;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const { user } = useUserAuth();
  const hideLayout = location.pathname === "/login" || location.pathname.startsWith("/dashboard");
  console.log("App.jsx - Context user object:", user);
  console.log("App.jsx - currentUserId being passed:", user?._id);
  return (
    <>
      {!hideLayout && <Navbar isLoggedIn={isLoggedIn} />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/program/:id" element={<ProgramDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/enrollment-success" element={<EnrollmentSuccess />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/challenges" element={<Challenge />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/membership" element={<MembershipPage />} />

        {/* Dashboard Nested Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="home" element={<DashboardHome />} />
          <Route path="myworkouts" element={<DashboardWorkouts />} />
          <Route path="myclasses" element={<DashboardClasses />} />
          <Route path="myprofile" element={<MyProfile />} />
          <Route path="nutritionplans" element={<NutritionPlans />} />
          <Route path="healthmetrics" element={<HealthMetrics />} />
          <Route path="challenges" element={<DashboardChellenges />} />
          <Route
            path="notifications"
            element={<Notifications currentUserId={user?._id} />}
          />
          <Route path="leaderboard" element={<Leaderboard currentUserId={user?.id} />} />
          <Route path="schedule" element={<MemberSchedule />} />
        </Route>
      </Routes>

      {!hideLayout && <Footer />}

      {/* Toast Container: only one instance for the whole app */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="dark"
        toastStyle={{
          backgroundColor: "#1E1E1E",
          color: "#fff",
          borderLeft: "6px solid #E3002A",
          fontFamily: "Poppins, sans-serif",
          borderRadius: "8px",
        }}
      />
    </>
  );
}

export default App;
