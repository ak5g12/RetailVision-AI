const express = require('express');
const { 
  createOrder, getMyOrders, getMyOrderById, 
  getOrderById, getOrders, updateOrderStatus 
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All order routes require auth

// Customer routes
router.post('/', authorize('CUSTOMER'), createOrder);
router.get('/myorders', authorize('CUSTOMER'), getMyOrders);
router.get('/myorders/:id', authorize('CUSTOMER'), getMyOrderById);

// Staff/Manager/Owner/Admin routes
router.get('/', authorize('STAFF', 'MANAGER', 'OWNER', 'ADMIN'), getOrders);
router.get('/:id', authorize('STAFF', 'MANAGER', 'OWNER', 'ADMIN'), getOrderById);
router.put('/:id/status', authorize('STAFF', 'MANAGER', 'OWNER', 'ADMIN'), updateOrderStatus);

module.exports = router;
