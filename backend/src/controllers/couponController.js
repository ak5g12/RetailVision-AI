const Coupon = require('../models/Coupon');
const crypto = require('crypto');

// POST /api/coupons
const createCoupon = async (req, res) => {
  try {
    const { customerId, discountPercentage } = req.body;
    
    if (!customerId || !discountPercentage) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (discountPercentage <= 0 || discountPercentage > 30) {
      return res.status(400).json({ message: 'Discount must be between 1 and 30' });
    }

    const code = 'RET-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    // Expire in 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const coupon = new Coupon({
      code,
      discountPercentage,
      customer: customerId,
      createdBy: req.user._id,
      expiryDate
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/coupons/my
const getMyCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ customer: req.user._id, active: true, expiryDate: { $gt: new Date() } });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCoupon,
  getMyCoupons
};
