import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckIcon, StarIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const MembershipPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/memberships", {
          withCredentials: true,
        });
        setPlans(res.data);
      } catch (err) {
        console.error("Failed to fetch memberships:", err);
        toast.error("Failed to load membership plans.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <div className="text-center py-40 text-gray-800">Loading membership plans...</div>;
  }

  return (
    <div className="membership-page font-sans">

      {/* Hero Banner */}
      <section className="relative h-[90vh] flex items-center justify-center text-white overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src="/fitness-banner.jpg"
            alt="Membership Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
        </motion.div>
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl mt-16 font-extrabold uppercase tracking-wide"
          >
            Membership <span className="text-[#E3002A]">Plans</span>
          </motion.h1>
          <motion.p
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-5 text-gray-200 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Unlock full access to all workouts, challenges, nutrition plans, and professional guidance. Choose the plan that fits your fitness goals.
          </motion.p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-24 px-6 md:px-12 bg-gray-50">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Pick Your Perfect Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {plans.map((plan) => (
            <motion.div
              key={plan._id}
              whileHover={{ scale: 1.05 }}
              className={`relative bg-white rounded-3xl shadow-2xl p-8 flex flex-col justify-between border-2 ${plan.popular ? "border-gradient-to-r from-[#E3002A] to-pink-500" : "border-[#E3002A]"} transition-transform`}
            >
              {plan.popular && (
                <div className="absolute -top-3 -right-3 w-32 h-10 bg-gradient-to-r from-[#E3002A] to-pink-500 text-white font-bold text-sm flex items-center justify-center shadow-lg transform rotate-12 hover:scale-105 transition-transform">
                  <StarIcon className="h-4 w-4 mr-1" /> Popular
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold mb-4 text-[#E3002A]">{plan.name}</h3>
                <p className="text-4xl font-extrabold mb-4 text-gray-900">₹{plan.price}</p>
                <p className="text-gray-500 mb-6">{plan.duration}</p>
                <ul className="space-y-3">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-700 hover:text-[#E3002A] transition-colors">
                      <CheckIcon className="h-5 w-5 text-[#E3002A]" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  const membershipItem = {
                    id: plan._id,
                    title: `${plan.name} Membership`,
                    price: plan.price,
                    duration: plan.duration,
                    desc: `${plan.name} plan for ${plan.duration}`,
                    isMembership: true,
                  };

                  navigate("/checkout", {
                    state: {
                      items: [membershipItem],
                      total: plan.price,
                      membershipId: plan._id,                 // ← ZAROORI LINE ADD KI
                      isMembershipPurchase: true,             // ← Optional but good for UI
                    },
                  });
                }}
                className="mt-6 bg-gradient-to-r from-[#E3002A] to-pink-500 hover:from-pink-500 hover:to-[#E3002A] text-white py-3 rounded-xl font-semibold text-lg transition-all shadow-lg"
              >
                Buy Now
              </button>
              
            </motion.div>
          ))}

        </div>
      </section>

    </div>
  );
};

export default MembershipPage;
