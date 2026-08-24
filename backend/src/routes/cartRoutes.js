const express = require('express');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All cart routes require authentication
router.use(authorize('CUSTOMER')); // Only customers use the cart

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:productId')
  .put(updateCartItem)
  .delete(removeCartItem);

module.exports = router;
