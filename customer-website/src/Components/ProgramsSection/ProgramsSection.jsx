import React from "react";
import { motion } from "framer-motion";
import { Dumbbell, HeartPulse, Flame, Apple, Users } from "lucide-react";

const ProgramsSection = () => {
  const programs = [
    {
      title: "Personal Training",
      desc: "Customized 1-on-1 sessions for your goals.",
      image: "/Personal-Trainig.jpg",
      icon: Dumbbell,
    },
    {
      title: "Yoga & Mindfulness",
      desc: "Find your inner peace and balance.",
      image: "/Yoga.jpg",
      icon: HeartPulse,
    },
    {
      title: "Weight Loss",
      desc: "Shed fat and feel more confident.",
      image: "/Weight Loss.jpg",
      icon: Flame,
    },
    {
      title: "Strength Training",
      desc: "Boost your power and endurance.",
      image: "/Strength Training.jpg",
      icon: HeartPulse,
    },
    {
      title: "Nutrition Plans",
      desc: "Eat clean and stay energetic.",
      image: "/Nutrition Plans.jpg",
      icon: Apple,
    },
    {
      title: "Group Classes",
      desc: "Train together, stay motivated.",
      image: "/Group Classes.jpg",
      icon: Users,
    },
  ];

  return (
    <section className="bg-white -py-1 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-[#E3002A] font-semibold italic text-base tracking-wide uppercase">
            Train Smarter
          </h3>
          <h2 className="text-4xl md:text-5xl font-extrabold uppercase text-black mt-1 leading-tight">
            Our Fitness Programs
          </h2>
          <p className="max-w-xl mx-auto text-gray-600 mt-3 text-sm md:text-base">
            Discover our focused programs to help you reach your fitness goals faster.
          </p>
        </motion.div>

        {/* Program Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {programs.map((program, index) => {
            const Icon = program.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative rounded-xl overflow-hidden group h-[300px] cursor-pointer shadow-md hover:shadow-[0_0_25px_#E3002A55] transition-all duration-500"
              >
                {/* Background Image */}
                <motion.img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-[#E3002A]/80 transition-all duration-500"></div>

                {/* Text + Icon */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-7 w-7 text-[#E3002A] group-hover:text-white transition-colors duration-300" />
                    <h3 className="text-base md:text-lg font-bold uppercase">
                      {program.title}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-200">{program.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
