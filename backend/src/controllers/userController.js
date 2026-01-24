const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });

  if (existingUser) {
    res.status(400);
    throw new Error('User with this email or username already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    subscription: {
      type: 'free',
      startDate: Date.now(),
      isActive: true
    }
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      token: token
    }
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Update last login
  user.lastLogin = Date.now();
  await user.save();
  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      token: token
    }
  });
});

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

module.exports = {
  registerUser,
  loginUser,
  getProfile
};
