const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');
const crypto = require('crypto');

// GET /api/pos/products
const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    const filter = { active: true };

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { SKU: { $regex: keyword, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).limit(20);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET /api/pos/customers
const searchCustomers = async (req, res) => {
  try {
    const { keyword } = req.query;

    const filter = {
      role: 'CUSTOMER'
    };

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } }
      ];
    }

    const customers = await User.find(filter)
      .select('-password')
      .limit(20);

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// POST /api/pos/customers
const createCustomer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({
        message: 'Name and either email or phone are required.'
      });
    }

    // Check duplicate customer
    const query = [];

    if (email) {
      query.push({ email });
    }

    if (phone) {
      query.push({ phone });
    }

    const existing = await User.findOne({
      $or: query,
      role: 'CUSTOMER'
    });

    if (existing) {
      return res.status(400).json({
        message: 'Customer with this email or phone already exists.',
        existingId: existing._id
      });
    }

    // Generate password for offline customer
    const password = crypto.randomBytes(8).toString('hex');

    // User schema requires email
    const finalEmail = email || `pos_${phone}@offline.local`;

    const customer = await User.create({
      name,
      email: finalEmail,
      phone,
      password,
      role: 'CUSTOMER'
    });

    res.status(201).json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// POST /api/pos/orders
const createPosOrder = async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const {
      customerId,
      customer: customerFromBody,
      items,
      discount,
      paymentMethod
    } = req.body;

    // Accept both customerId and customer
    const targetCustomerId = customerId || customerFromBody;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: 'No items provided'
      });
    }

    // Validate payment method
    if (!['CASH', 'CARD', 'UPI'].includes(paymentMethod)) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: 'Invalid payment method'
      });
    }

    // Find customer
    let customer = null;

    if (targetCustomerId) {
      customer = await User.findOne({
        _id: targetCustomerId,
        role: 'CUSTOMER'
      });

      if (!customer) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          message: 'Invalid customer ID'
        });
      }
    }

    let subtotal = 0;

    const orderItems = [];

    // Process products
    for (const item of items) {

      if (
        !item.productId ||
        !item.quantity ||
        item.quantity < 1
      ) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          message: 'Invalid item data'
        });
      }

      const product = await Product.findById(
        item.productId
      ).session(session);

      if (!product || !product.active) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          message: `Product ${
            product ? product.name : 'Unknown'
          } is no longer available`
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }

      // Deduct stock
      product.stock -= item.quantity;

      await product.save({
        session
      });

      // Calculate subtotal
      subtotal += product.price * item.quantity;

      // Add order item
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        costPrice: product.costPrice || 0
      });
    }

    // Generate POS order number
    const orderNumber =
      'POS-' +
      crypto.randomBytes(4).toString('hex').toUpperCase();

    const appliedDiscount = Number(discount) || 0;

    // Validate discount
    if (
      appliedDiscount < 0 ||
      appliedDiscount > subtotal
    ) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        message: 'Invalid discount'
      });
    }

    // Calculate tax
    const taxableAmount =
      subtotal - appliedDiscount;

    const tax = taxableAmount * 0.10;

    const total =
      subtotal -
      appliedDiscount +
      tax;

    // Create order
    const order = new Order({
      orderNumber,

      // IMPORTANT:
      // Save actual customer when selected in POS
      customer: customer
        ? customer._id
        : undefined,

      cashier: req.user._id,

      items: orderItems,

      subtotal,

      discount: appliedDiscount,

      tax,

      total,

      source: 'POS',

      paymentMethod,

      paymentStatus: 'PAID',

      orderStatus: 'COMPLETED'
    });

    await order.save({
      session
    });

    await session.commitTransaction();

    session.endSession();

    res.status(201).json(order);

  } catch (error) {

    await session.abortTransaction();

    session.endSession();

    console.error('POS Order Error:', error);

    res.status(500).json({
      message: error.message
    });
  }
};


// GET /api/pos/orders
const listPosOrders = async (req, res) => {
  try {

    const orders = await Order.find({
      source: 'POS'
    })
      .populate('customer', 'name email phone')
      .populate('cashier', 'name')
      .sort({
        createdAt: -1
      });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


// GET /api/pos/orders/:id
const getPosOrderById = async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      source: 'POS'
    })
      .populate(
        'customer',
        'name email phone'
      )
      .populate(
        'cashier',
        'name email'
      )
      .populate(
        'items.product',
        'SKU images'
      );

    if (!order) {
      return res.status(404).json({
        message: 'POS Order not found'
      });
    }

    res.json(order);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


// Export controllers
module.exports = {
  searchProducts,
  searchCustomers,
  createCustomer,
  createPosOrder,
  listPosOrders,
  getPosOrderById
};