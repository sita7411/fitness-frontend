// controllers/cartController.js
import Cart from "../models/Cart.js";

const calculateCartTotals = (cart) => {
  cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
};

// Helper to get or create cart
const getUserCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    calculateCartTotals(cart);
    await cart.save();
  }
  return cart;
};

// Get cart
export const getCart = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Not authenticated" });

    const cart = await Cart.findOne({ userId: req.user.id }).lean();
    
    if (!cart || cart.items.length === 0) {
      return res.json({ items: [], totalAmount: 0, itemCount: 0 });
    }

    res.json({
      items: cart.items,
      totalAmount: cart.totalAmount || 0,
      itemCount: cart.itemCount || cart.items.length,
    });
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add to cart
export const addToCart = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Not authenticated" });

    const { item } = req.body;
    if (!item || !item.id || !item.type || !item.price) {
      return res.status(400).json({ message: "Invalid item data" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [{ ...item, quantity: item.quantity || 1 }],
      });
    } else {
      const existingIndex = cart.items.findIndex(
        (i) => i.id === item.id && i.type === item.type
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += item.quantity || 1;
      } else {
        cart.items.push({ ...item, quantity: item.quantity || 1 });
      }
    }

    calculateCartTotals(cart);
    await cart.save();

    res.json({
      items: cart.items,
      totalAmount: cart.totalAmount,
      itemCount: cart.itemCount,
    });
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Increase quantity
export const increaseQuantity = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Not authenticated" });

    const { id, type } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.json({ items: [], totalAmount: 0, itemCount: 0 });

    const itemIndex = cart.items.findIndex((i) => i.id === id && i.type === type);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    }

    calculateCartTotals(cart);
    await cart.save();

    res.json({
      items: cart.items,
      totalAmount: cart.totalAmount,
      itemCount: cart.itemCount,
    });
  } catch (err) {
    console.error("increaseQuantity error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Decrease quantity / remove if 0
export const removeFromCart = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Not authenticated" });

    const { id, type } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.json({ items: [], totalAmount: 0, itemCount: 0 });

    const itemIndex = cart.items.findIndex((i) => i.id === id && i.type === type);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity -= 1;
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    }

    calculateCartTotals(cart);
    await cart.save();

    res.json({
      items: cart.items,
      totalAmount: cart.totalAmount,
      itemCount: cart.itemCount,
    });
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update quantity directly
export const updateQuantity = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Not authenticated" });

    const { id, type, quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ message: "Quantity must be at least 1" });

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.json({ items: [], totalAmount: 0, itemCount: 0 });

    const itemIndex = cart.items.findIndex((i) => i.id === id && i.type === type);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.items = cart.items.filter((i) => i.quantity > 0);
    calculateCartTotals(cart);
    await cart.save();

    res.json({
      items: cart.items,
      totalAmount: cart.totalAmount,
      itemCount: cart.itemCount,
    });
  } catch (err) {
    console.error("updateQuantity error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove entire item
export const removeItem = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Not authenticated" });

    const { id, type } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.json({ items: [], totalAmount: 0, itemCount: 0 });

    cart.items = cart.items.filter((i) => !(i.id === id && i.type === type));
    calculateCartTotals(cart);
    await cart.save();

    res.json({
      items: cart.items,
      totalAmount: cart.totalAmount,
      itemCount: cart.itemCount,
    });
  } catch (err) {
    console.error("removeItem error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Not authenticated" });

    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: [], totalAmount: 0, itemCount: 0 },
      { upsert: true }
    );

    res.json({ items: [], totalAmount: 0, itemCount: 0 });
  } catch (err) {
    console.error("clearCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};