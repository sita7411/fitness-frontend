import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Users, Star, HeartPulse } from "lucide-react";

export default function ContactUs() {
  const floatingIcons = [
    { icon: <Mail size={32} />, x: "10%", y: "30%", delay: 0 },
    { icon: <Phone size={30} />, x: "85%", y: "40%", delay: 1 },
    { icon: <MapPin size={28} />, x: "20%", y: "70%", delay: 1.5 },
    { icon: <Users size={36} />, x: "50%", y: "15%", delay: 0.5 },
    { icon: <Star size={32} />, x: "65%", y: "65%", delay: 2 },
    { icon: <HeartPulse size={28} />, x: "75%", y: "25%", delay: 2.5 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative w-full h-[300px] md:h-[400px] text-white flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80"
            alt="Contact Banner"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-red-600/40 to-black/90" />
        </div>

        {/* Floating Icons */}
        <motion.div className="absolute inset-0 z-10 pointer-events-none">
          {floatingIcons.map((item, idx) => (
            <motion.div
              key={idx}
              style={{ position: "absolute", left: item.x, top: item.y }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{
                duration: 3,
                delay: item.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-white/70 drop-shadow-lg"
            >
              {item.icon}
            </motion.div>
          ))}
        </motion.div>

        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 max-w-4xl mx-auto px-4"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-xl">
            Contact Us
          </h1>
          <p className="text-gray-300 text-lg md:text-xl">
            Get in touch with us for inquiries, support, or feedback.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
          <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
          <form className="space-y-4">
            <Input label="Full Name" placeholder="Your Name" />
            <Input label="Email" placeholder="you@example.com" type="email" />
            <Input label="Subject" placeholder="Subject" />
            <Textarea label="Message" placeholder="Your message..." rows={5} />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col justify-center gap-6">
          <h2 className="text-2xl font-semibold">Contact Information</h2>
          <p className="text-gray-700">
            We’d love to hear from you! Reach out via phone, email, or visit our office.
          </p>

          <div className="flex items-center gap-3 text-gray-700">
            <MapPin className="text-red-600" />
            <span>123 Fitness Street, Wellness City, Country</span>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Phone className="text-red-600" />
            <span>+123 456 7890</span>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Mail className="text-red-600" />
            <span>support@fitnessapp.com</span>
          </div>

          {/* Optional Google Map */}
          <div className="mt-6 w-full h-64 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.086874341354!2d-122.419415684681!3d37.77492977975944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085818f6e8baf2d%3A0x4296c576b9abfb2a!2sSan+Francisco!5e0!3m2!1sen!2sus!4v1690000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              allowFullScreen=""
              loading="lazy"
              className="border-0"
              title="Company Location"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------- INPUT COMPONENTS ---------- */
function Input({ label, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
      />
    </div>
  );
}

function Textarea({ label, placeholder, rows }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none"
      />
    </div>
  );
}
