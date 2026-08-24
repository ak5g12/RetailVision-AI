const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const crypto = require('crypto');

// POST /api/orders
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    if (req.user.role !== 'CUSTOMER') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Only accounts with CUSTOMER role can place online orders.' });
    }

    const { buyNowItem, couponCode } = req.body;
    let itemsToProcess = [];
    let cart = null;

    if (buyNowItem) {
      if (!buyNowItem.productId || !buyNowItem.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Invalid buy now item data' });
      }
      itemsToProcess = [{
        product: { _id: buyNowItem.productId },
        quantity: buyNowItem.quantity
      }];
    } else {
      cart = await Cart.findOne({ user: req.user._id }).populate('items.product').session(session);
      
      if (!cart || cart.items.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Cart is empty' });
      }
      itemsToProcess = cart.items;
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of itemsToProcess) {
      const product = await Product.findById(item.product._id).session(session);
      
      if (!product || !product.active) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Product ${product ? product.name : 'Unknown'} is no longer available` });
      }
      
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save({ session });

      subtotal += product.price * item.quantity;
      
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        costPrice: product.costPrice || 0
      });
    }

    let discount = 0;
    if (couponCode) {
      const Coupon = require('../models/Coupon');
      const validCoupon = await Coupon.findOne({ code: couponCode, customer: req.user._id, active: true }).session(session);
      if (validCoupon && (!validCoupon.expiryDate || validCoupon.expiryDate > new Date())) {
        discount = (subtotal * validCoupon.discountPercentage) / 100;
        validCoupon.active = false;
        await validCoupon.save({ session });
      }
    }

    const orderNumber = 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const tax = (subtotal - discount) * 0.10; // 10% tax on discounted amount
    const total = subtotal - discount + tax;

    const order = new Order({
      orderNumber,
      customer: req.user._id,
      items: orderItems,
      subtotal,
      discount,
      tax,
      total,
      source: 'ONLINE',
      paymentStatus: 'PAID',
      orderStatus: 'COMPLETED'
    });

    await order.save({ session });

    // Clear cart if it wasn't a buyNow
    if (!buyNowItem && cart) {
      cart.items = [];
      await cart.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/myorders/:id
const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/:id (Admin/Manager)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders (Admin/Manager)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('customer', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/orders/:id/status (Admin/Manager)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const wasCompleted = order.orderStatus === 'COMPLETED' || order.orderStatus === 'DELIVERED';

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    const isNowCompleted = order.orderStatus === 'COMPLETED' || order.orderStatus === 'DELIVERED';

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getOrderById,
  getOrders,
  updateOrderStatus
};
