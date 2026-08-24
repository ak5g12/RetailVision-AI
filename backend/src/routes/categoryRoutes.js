const express = require('express');
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize, optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', optionalAuth, getCategories);
router.get('/:id', optionalAuth, getCategoryById);
router.post('/', protect, authorize('MANAGER', 'OWNER', 'ADMIN'), createCategory);
router.put('/:id', protect, authorize('MANAGER', 'OWNER', 'ADMIN'), updateCategory);
router.delete('/:id', protect, authorize('MANAGER', 'OWNER', 'ADMIN'), deleteCategory);

module.exports = router;
