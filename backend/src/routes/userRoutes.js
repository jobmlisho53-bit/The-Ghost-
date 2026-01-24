const express = require('express');
const { protect } = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  getProfile
} = require('../controllers/userController');

const router = express.Router();

// Public routes
router.route('/register')
  .post(registerUser);

router.route('/login')
  .post(loginUser);

// Protected routes
router.route('/profile')
  .get(protect, getProfile);

module.exports = router;
