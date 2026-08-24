const express = require('express');
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize, optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProductById);
router.post('/', protect, authorize('MANAGER', 'OWNER', 'ADMIN'), createProduct);
router.put('/:id', protect, authorize('MANAGER', 'OWNER', 'ADMIN'), updateProduct);
router.delete('/:id', protect, authorize('MANAGER', 'OWNER', 'ADMIN'), deleteProduct);

module.exports = router;
