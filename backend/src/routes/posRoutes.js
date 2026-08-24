const express = require('express');
const { 
  searchProducts, searchCustomers, createCustomer, createPosOrder, 
  listPosOrders, getPosOrderById 
} = require('../controllers/posController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All POS routes require auth
router.use(authorize('STAFF', 'MANAGER', 'OWNER', 'ADMIN')); // Restricted to staff and above

router.get('/products', searchProducts);
router.get('/customers', searchCustomers);
router.post('/customers', createCustomer);
router.post('/orders', createPosOrder);
router.get('/orders', listPosOrders);
router.get('/orders/:id', getPosOrderById);

module.exports = router;
