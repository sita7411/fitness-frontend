
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;

const iconMap = {
  Mail: Mail,
  Phone: Phone,
  MapPin: MapPin,
  Users: () => null,
  Star: () => null,
  HeartPulse: () => null,
};

export default function ContactUs() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("user_token");
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`, {
          withCredentials: false,
          headers: { Authorization: `Bearer ${token}` }
      });
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Settings load error:", err);
        // Fallback data if API fails
        setSettings({
          logo: null,
          address: "123 Fitness Street, Wellness City",
          phone: "+123 456 7890",
          email: "support@fitnessapp.com",
          mapEmbed: "",
          floatingIcons: [
            { icon: "Mail", x: "10%", y: "30%", delay: 0 },
            { icon: "Phone", x: "85%", y: "40%", delay: 1 },
            { icon: "MapPin", x: "20%", y: "70%", delay: 1.5 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading contact information...</div>
      </div>
    );
  }

  const floatingIcons = settings.floatingIcons || [];

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

        {/* Dynamic Floating Icons from Backend */}
        <motion.div className="absolute inset-0 z-10 pointer-events-none">
          {floatingIcons.map((item, idx) => {
            const IconComponent = iconMap[item.icon] || Mail; // fallback to Mail
            return (
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
                <IconComponent size={32} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Title */}
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

        {/* Contact Info - Fully Dynamic */}
        <div className="flex flex-col justify-center gap-6">
          <h2 className="text-2xl font-semibold">Contact Information</h2>
          <p className="text-gray-700">
            We’d love to hear from you! Reach out via phone, email, or visit our office.
          </p>

          <div className="flex items-center gap-3 text-gray-700">
            <MapPin className="text-red-600" />
            <span>{settings.address}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Phone className="text-red-600" />
            <span>{settings.phone}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Mail className="text-red-600" />
            <span>{settings.email}</span>
          </div>

          {/* Dynamic Map */}
          {settings.mapEmbed ? (
            <div className="mt-6 w-full h-64 rounded-lg overflow-hidden shadow-md">
              <iframe
                src={settings.mapEmbed}
                width="100%"
                height="100%"
                allowFullScreen=""
                loading="lazy"
                className="border-0"
                title="Our Location"
              ></iframe>
            </div>
          ) : (
            <div className="mt-6 w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Map not configured yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Input Components (same as before) */
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
