const express = require('express');
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);

// Example of role-restricted route for testing
router.get('/admin-only', protect, authorize('ADMIN'), (req, res) => {
  res.json({ message: 'Admin area accessed' });
});

module.exports = router;
