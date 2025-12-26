import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 pt-16 pb-8 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand Section */}
        <div>
          <img
            src="/logo.png"
            alt="FitHealth Logo"
            className="h-50 -mt-17  w-auto mb-4 -ml-2"
          />
          <p className="text-sm text-gray-400 -mt-15 leading-relaxed mb-6">
            Empowering your fitness journey with expert trainers, personalized programs,
            and a community that motivates you to stay strong and healthy.
          </p>

          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-800 hover:bg-[#E3002A] transition-all"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-800 hover:bg-[#E3002A] transition-all"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-800 hover:bg-[#E3002A] transition-all"
            >
              <Twitter size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-800 hover:bg-[#E3002A] transition-all"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link to="/" className="hover:text-[#E3002A] transition-all">Home</Link>
            </li>
            <li>
              <Link to="/programs" className="hover:text-[#E3002A] transition-all">Programs</Link>
            </li>
            <li>
              <Link to="/trainers" className="hover:text-[#E3002A] transition-all">Trainers</Link>
            </li>
            <li>
              <Link to="/classes" className="hover:text-[#E3002A] transition-all">Classes</Link>
            </li>
            <li>
              <Link to="/challenges" className="hover:text-[#E3002A] transition-all">Challenges</Link>
            </li>
            <li>
              <Link to="/nutrition" className="hover:text-[#E3002A] transition-all">Nutrition</Link>
            </li>
                  <li>
              <Link to="/myaccount" className="hover:text-[#E3002A] transition-all">My Account</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link to="/faq" className="hover:text-[#E3002A] transition-all">FAQs</Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="hover:text-[#E3002A] transition-all">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-[#E3002A] transition-all">Terms & Conditions</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#E3002A] transition-all">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Get In Touch</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>📍 123 Fitness Street, Mumbai</li>
            <li>📞 +91 98765 43210</li>
            <li>
              ✉️{" "}
              <a
                href="mailto:info@fithealth.com"
                className="hover:text-[#E3002A] transition-all"
              >
                info@fithealth.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()}{" "}
        <span className="text-[#E3002A] font-semibold">FitHealth</span>. All Rights Reserved.
      </div>
    </footer>
  );
}
