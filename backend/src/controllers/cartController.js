const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price stock active');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid product ID and positive quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.active) {
      return res.status(400).json({ message: 'Product not found or inactive' });
    }
    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items left in stock` });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ message: `Cannot add more. Only ${product.stock} items left in stock` });
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product', 'name price stock active');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/cart/:productId
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    
    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ message: 'Positive quantity is required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(400).json({ message: 'Product not found' });
    
    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items left in stock` });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name price stock active');
      return res.json(updatedCart);
    } else {
      return res.status(404).json({ message: 'Item not in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/cart/:productId
const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(p => p.product.toString() !== productId);
    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'name price stock active');
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
