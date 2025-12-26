import { motion } from "framer-motion";
import { Clock, Dumbbell, Utensils, Calendar } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Clock,
      title: "Progression",
      description:
        "Track your performance over time with detailed analytics and insights designed to inspire growth.",
    },
    {
      icon: Dumbbell,
      title: "Workouts",
      description:
        "Personalized fitness plans curated to match your strength, endurance, and lifestyle goals.",
    },
    {
      icon: Utensils,
      title: "Nutrition",
      description:
        "Balanced meal plans and nutrition guidance to support your training and recovery journey.",
    },
    {
      icon: Calendar,
      title: "Daily Planner",
      description:
        "Stay organized with daily tracking, reminders, and smart goal setting for long-term consistency.",
    },
  ];

  return (
    <section className="w-full py-25 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
        >
          OUR FEATURES
        </motion.h2>

        {/* Subtitle */}
        <p className="text-gray-600 max-w-2xl mx-auto mb-20 text-base md:text-lg leading-relaxed">
          Discover the tools designed to elevate your fitness journey - simple,
          effective, and personalized for your success.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative flex items-center justify-center w-20 h-20 mb-6">
                  <span className="absolute inset-0 rounded-full bg-[#E3002A]/10 scale-110 blur-lg"></span>
                  <Icon className="w-10 h-10 text-[#E3002A] relative z-10" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 hover:text-[#E3002A] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
