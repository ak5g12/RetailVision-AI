const express = require('express');
const { createCoupon, getMyCoupons } = require('../controllers/couponController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/my', getMyCoupons);

// Admin/Manager only
router.post('/', authorize('ADMIN', 'MANAGER'), createCoupon);

module.exports = router;
