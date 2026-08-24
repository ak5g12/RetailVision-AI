const express = require('express');
const { getUsers, createUser, updateUserRole, toggleUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// All user management routes require ADMIN privileges
router.use(protect);
router.use(authorize('ADMIN'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.put('/:id/role', updateUserRole);
router.put('/:id/status', toggleUserStatus);

module.exports = router;
