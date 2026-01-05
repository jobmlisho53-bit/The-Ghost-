const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user || !req.user.isActive) {
        res.status(401);
        throw new Error('Not authorized, user inactive');
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Check if user has active subscription
const checkSubscription = asyncHandler(async (req, res, next) => {
  if (!req.user.subscription) {
    res.status(402); // Payment Required
    throw new Error('Active subscription required');
  }

  // Check subscription status
  const subscription = await req.user.populate('subscription').subscription;
  
  if (subscription.status !== 'active') {
    res.status(402);
    throw new Error('Subscription is not active');
  }

  // Check quota
  if (subscription.plan === 'free') {
    const requestCount = await ContentRequest.countDocuments({
      user: req.user._id,
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
      }
    });

    if (requestCount >= subscription.monthlyQuota) {
      res.status(402);
      throw new Error('Monthly quota exceeded. Please upgrade your subscription.');
    }
  }

  next();
});

module.exports = { protect, checkSubscription };
