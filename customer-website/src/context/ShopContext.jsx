// src/context/ShopContext.jsx
import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/auth`,  // ← वैसा ही रखा (तुम्हारी मर्जी)
    withCredentials: false,
});

// 🔥 यही एक नया change है — Bearer token automatically हर request में लग जाएगा
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("user_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API ${config.method.toUpperCase()} → ${config.url}`);
    return config;
});

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);

    // Load cart from backend
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await api.get("/cart"); // ← अब token header लगेगा
                setCartItems(res.data.items || []);
            } catch (err) {
                console.error("Failed to load cart:", err);
                toast.error("Could not load cart");

                const saved = localStorage.getItem("fittrack_cart");
                if (saved) {
                    try {
                        setCartItems(JSON.parse(saved));
                        toast.info("Cart restored from browser");
                    } catch (e) {
                        console.error("Corrupted cart data", e);
                    }
                }
            }
        };
        fetchCart();
    }, []);

    // Sync to localStorage
    useEffect(() => {
        if (cartItems.length > 0) {
            localStorage.setItem("fittrack_cart", JSON.stringify(cartItems));
        } else {
            localStorage.removeItem("fittrack_cart");
        }
    }, [cartItems]);

    const addToCart = async (item) => {
        // तुम्हारा पूरा smart detection logic वैसा ही...

        let cartType = "program";

        if (item.type) {
            const type = item.type.toString().toLowerCase().trim();
            if (type === "challenge") cartType = "challenge";
            else if (type === "class") cartType = "class";
            else if (type === "nutrition" || type === "nutritionplan" || type === "mealplan") cartType = "nutrition";
            else if (type === "program") cartType = "program";
        }
        else if (item.category) {
            const cat = item.category.toString().toLowerCase().trim();
            if (cat === "challenge") cartType = "challenge";
            else if (cat === "nutrition") cartType = "nutrition";
            else if (cat === "class") cartType = "class";
        }
        else {
            const text = `${item.title || item.name || ""}`.toLowerCase();
            if (text.includes("challenge")) cartType = "challenge";
            else if (text.includes("nutrition") || text.includes("meal") || text.includes("diet") || text.includes("plan") && text.includes("day")) {
                cartType = "nutrition";
            }
            else if (text.includes("class") || text.includes("session")) cartType = "class";
        }

        const itemId = item._id?.toString() ||
            item.id?.toString() ||
            item.classId?.toString() ||
            item.planId?.toString();

        if (!itemId) {
            toast.error("Invalid item selected!");
            console.error("No valid ID found in item:", item);
            return;
        }

        const cartItem = {
            id: itemId,
            type: cartType,
            title: item.title || item.name || "Untitled Item",
            desc: (item.description || item.subtitle || item.desc || "No description available").slice(0, 150) + "...",
            image: item.coverImage?.url || item.thumbnail || item.image || item.images?.[0] || "/placeholder-nutrition.jpg",
            price: Number(item.price) || 0,
            duration: item.duration || "4 Weeks",
            difficulty: item.level || "Beginner",
            trainerName: item.trainerName || "Nutritionist",
            quantity: 1,
        };

        console.log("Adding to cart →", cartItem);

        setIsSyncing(true);
        try {
            const res = await api.post("/cart/add", { item: cartItem }); // ← token लगेगा
            setCartItems(res.data.items || []);
            toast.success(`${cartItem.title} added to cart!`);
        } catch (err) {
            console.error("Add to cart failed:", err.response?.data || err);
            toast.error(err.response?.data?.message || "Failed to add to cart");
        } finally {
            setIsSyncing(false);
        }
    };

    // बाकी सारे functions बिल्कुल वैसा ही — कोई change नहीं
    const increaseQuantity = async (itemId, itemType = "program") => {
        setIsSyncing(true);
        try {
            const res = await api.post("/cart/increase", { id: itemId, type: itemType });
            setCartItems(res.data.items || []);
            toast.success("Quantity increased");
        } catch (err) {
            toast.error("Failed to increase");
        } finally {
            setIsSyncing(false);
        }
    };

    const decreaseQuantity = async (itemId, itemType = "program") => {
        setIsSyncing(true);
        try {
            const res = await api.post("/cart/remove", { id: itemId, type: itemType });
            setCartItems(res.data.items || []);
            toast.success("Quantity decreased");
        } catch (err) {
            toast.error("Failed to decrease");
        } finally {
            setIsSyncing(false);
        }
    };

    const updateQuantity = async (itemId, itemType, quantity) => {
        if (quantity < 1) return removeItem(itemId, itemType);
        setIsSyncing(true);
        try {
            const res = await api.post("/cart/update-quantity", { id: itemId, type: itemType, quantity });
            setCartItems(res.data.items || []);
            toast.success(`Quantity: ${quantity}`);
        } catch (err) {
            toast.error("Update failed");
        } finally {
            setIsSyncing(false);
        }
    };

    const removeItem = async (itemId, itemType = "program") => {
        setIsSyncing(true);
        try {
            const res = await api.post("/cart/remove-item", { id: itemId, type: itemType });
            setCartItems(res.data.items || []);
            toast.success("Item removed");
        } catch (err) {
            toast.error("Failed to remove");
        } finally {
            setIsSyncing(false);
        }
    };

    const clearCart = async () => {
        setIsSyncing(true);
        try {
            await api.post("/cart/clear");
            setCartItems([]);
            localStorage.removeItem("fittrack_cart");
            toast.warning("Cart cleared!");
        } catch (err) {
            toast.error("Failed to clear cart");
        } finally {
            setIsSyncing(false);
        }
    };

    const cartSummary = useMemo(() => {
        const count = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
        const total = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
        return { cartCount: count, totalPrice: total, totalItems: cartItems.length };
    }, [cartItems]);

    const value = {
        cartItems,
        isSyncing,
        addToCart,
        removeItem,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        cartCount: cartSummary.cartCount,
        totalPrice: cartSummary.totalPrice,
        totalItems: cartSummary.totalItems,
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error("useShop must be used within ShopProvider");
    return context;
};
