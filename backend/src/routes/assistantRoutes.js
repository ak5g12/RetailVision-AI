const express = require('express');
const { handleQuery } = require('../controllers/assistantController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Only OWNER, MANAGER, ADMIN can access the assistant
router.post('/query', protect, authorize('MANAGER', 'OWNER', 'ADMIN'), handleQuery);

module.exports = router;
