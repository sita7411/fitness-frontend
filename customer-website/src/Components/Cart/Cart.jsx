// src/pages/Cart.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { Dumbbell, HeartPulse, Flame, Apple, Users, Timer } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    addToCart,
    removeItem,
    clearCart,
    decreaseQuantity,
    increaseQuantity, 
    updateQuantity,   
    totalPrice,
  } = useShop();
  const navigate = useNavigate();

  // Checkout handler
  const handleCheckout = () => {
    if (!cartItems.length) {
      toast.error("Your cart is empty!");
      return;
    }
    navigate("/checkout", { state: { items: cartItems, total: totalPrice } });
    toast.success("Proceeding to checkout!");
  };

  // Decrease quantity
  const handleDecrease = (item) => {
    decreaseQuantity(item.id, item.type);
  }

  // Increase quantity
  const handleIncrease = (item) => {
    increaseQuantity(item.id, item.type);
  };

  // Update quantity manually (input field, if added)
  const handleUpdate = (item, value) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity > 0) {
      updateQuantity(item.id, item.type, quantity);
    }
  };

  // ---------- EMPTY CART ----------
  if (cartItems.length === 0)
    return (
      <>
        {/* ---------- HERO BANNER ---------- */}
        <section className="relative w-full h-[430px] text-white text-center overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=1400&q=80"
              alt="Cart Banner"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#E3002A]/60 to-black/90" />
          </div>
          <motion.div className="absolute inset-0 z-10 pointer-events-none">
            {[
              { icon: <Dumbbell size={40} />, x: "8%", y: "25%", delay: 0 },
              { icon: <HeartPulse size={34} />, x: "85%", y: "40%", delay: 1 },
              { icon: <Flame size={30} />, x: "20%", y: "75%", delay: 1.5 },
              { icon: <Apple size={28} />, x: "70%", y: "65%", delay: 2 },
              { icon: <Users size={38} />, x: "50%", y: "20%", delay: 0.5 },
              { icon: <Timer size={32} />, x: "60%", y: "15%", delay: 2.5 },
            ].map((item, index) => (
              <motion.div
                key={index}
                style={{ position: "absolute", left: item.x, top: item.y }}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  delay: item.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-white/70 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
              >
                {item.icon}
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-20 max-w-4xl mx-auto px-6"
          >
            <h1 className="text-5xl md:text-6xl mt-20 font-extrabold mb-6 uppercase tracking-[0.15em] drop-shadow-xl">
              Your Cart
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8">
              Review your selected programs and challenges.
            </p>
          </motion.div>
        </section>
        <div className="flex flex-col items-center justify-center py-40 bg-gradient-to-b from-gray-50 to-white">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Your Cart is Empty
          </h2>
          <Link
            to="/programs"
            className="px-8 py-3 bg-[#E3002A] text-white rounded-full font-semibold hover:bg-red-600 transition-all duration-300 shadow-md"
          >
            Browse Programs & Challenges
          </Link>
        </div>

      </>
    );

  return (
    <>
      {/* ---------- HERO BANNER ---------- */}
      <section className="relative w-full h-[430px] text-white text-center overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=1400&q=80"
            alt="Cart Banner"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#E3002A]/40 to-black/90" />
        </div>
        <motion.div className="absolute inset-0 z-10 pointer-events-none">
          {[
            { icon: <Dumbbell size={40} />, x: "8%", y: "25%", delay: 0 },
            { icon: <HeartPulse size={34} />, x: "85%", y: "40%", delay: 1 },
            { icon: <Flame size={30} />, x: "20%", y: "75%", delay: 1.5 },
            { icon: <Apple size={28} />, x: "70%", y: "65%", delay: 2 },
            { icon: <Users size={38} />, x: "50%", y: "20%", delay: 0.5 },
            { icon: <Timer size={32} />, x: "60%", y: "15%", delay: 2.5 },
          ].map((item, index) => (
            <motion.div
              key={index}
              style={{ position: "absolute", left: item.x, top: item.y }}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{
                duration: 3,
                delay: item.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-white/70 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
            >
              {item.icon}
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 max-w-4xl mx-auto px-6"
        >
          <h1 className="text-5xl md:text-6xl mt-20 font-extrabold mb-6 uppercase tracking-[0.15em] drop-shadow-xl">
            Your Cart
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-8">
            Manage your selected programs and challenges before checkout.
          </p>
        </motion.div>
      </section>

      {/* ---------- CART CONTENT ---------- */}
      <div className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-b from-gray-50 to-white">
        <h1 className="text-4xl font-bold mb-10 text-[#E3002A] border-b pb-2 border-[#E3002A]/30">
          Cart Summary
        </h1>
        <div className="flex flex-col lg:flex-row gap-10">
          {/* ---------- Cart Items ---------- */}
          <div className="flex-1 space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Left: Image + Info */}
                <div className="flex items-center gap-6">
                  <img
                    src={item.image || "/challenges-placeholder.jpg"}
                    alt={item.title || item.name}
                    className="w-24 h-24 object-cover rounded-lg shadow"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {item.title || item.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {item.desc || item.description}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Duration:</strong> {item.duration?.trim() || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Trainer:</strong> {item.trainerName || "Self-Guided"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Difficulty:</strong> {item.difficulty || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Right: Controls */}
                <div className="flex flex-col items-end gap-3">
                  <span className="text-lg font-semibold text-[#E3002A]">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDecrease(item)}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      disabled={item.quantity <= 0}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-lg font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrease(item)}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      disabled={false}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id, item.type)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all duration-300"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- Summary ---------- */}
          <div className="w-full lg:w-1/3 p-6 bg-white border border-gray-200 rounded-2xl shadow-md flex flex-col justify-between">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-200 mb-4">
              Order Summary
            </h2>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-2 border-b border-gray-200"
                >
                  <img
                    src={item.image || "/challenges-placeholder.jpg"}
                    alt={item.title || item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-gray-800 font-semibold">{item.title || item.name}</h3>
                    <p className="text-gray-500 text-sm">{item.desc || item.description}</p>
                  </div>
                  <span className="text-[#E3002A] font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
              <div className="text-gray-700 text-lg">
                <p>
                  Total Items:{" "}
                  <span className="font-bold text-[#E3002A]">
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </p>
                <p>
                  Total Price:{" "}
                  <span className="font-bold text-[#E3002A]">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
            <div className="space-y-4 mt-4">
              <button
                onClick={handleCheckout}
                className="w-full px-4 py-3 bg-[#E3002A] text-white rounded-full font-semibold hover:bg-red-600 transition-all duration-300"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={clearCart}
                className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-full font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{
          backgroundColor: "#1E1E1E",
          color: "#fff",
          borderLeft: "6px solid #E3002A",
          fontFamily: "Poppins, sans-serif",
        }}
      />
    </>
  );
};

export default Cart;
