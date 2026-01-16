const asyncHandler = require('express-async-handler');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Create subscription
// @route   POST /api/v1/payments/subscribe
// @access  Private
const createSubscription = asyncHandler(async (req, res) => {
  const { plan, billingCycle } = req.body;

  if (!plan) {
    res.status(400);
    throw new Error('Plan is required');
  }

  // Create or update subscription
  const subscription = await Subscription.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      plan,
      billingCycle: billingCycle || 'monthly',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000), // Simple calculation
      maxConcurrentRequests: plan === 'premium' ? 3 : plan === 'enterprise' ? 10 : 1,
      videoQuality: plan === 'premium' ? '1080p' : plan === 'enterprise' ? '4k' : '480p',
      features: {
        adFree: plan !== 'free',
        earlyAccess: plan !== 'free',
        priorityProcessing: plan !== 'free',
        customStyles: plan === 'enterprise',
      }
    },
    {
      new: true,
      upsert: true,
    }
  );

  // Update user with subscription
  await User.findByIdAndUpdate(
    req.user._id,
    { subscription: subscription._id },
    { new: true }
  );

  res.status(201).json({
    success: true,
    data: subscription,
  });
});

// @desc    Cancel subscription
// @route   POST /api/v1/payments/cancel
// @access  Private
const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOneAndUpdate(
    { user: req.user._id },
    { status: 'cancelled' },
    { new: true }
  );

  if (!subscription) {
    res.status(404);
    throw new Error('No subscription found');
  }

  res.status(200).json({
    success: true,
    data: subscription,
  });
});

// @desc    Get payment history
// @route   GET /api/v1/payments/history
// @access  Private
const getPaymentHistory = asyncHandler(async (req, res) => {
  // For now, returning mock data
  const paymentHistory = [
    {
      id: 1,
      date: '2023-07-01',
      amount: 9.99,
      plan: 'Premium Monthly',
      status: 'Completed',
    },
    {
      id: 2,
      date: '2023-06-01',
      amount: 9.99,
      plan: 'Premium Monthly',
      status: 'Completed',
    },
  ];

  res.status(200).json({
    success: true,
    data: paymentHistory,
  });
});

module.exports = {
  createSubscription,
  cancelSubscription,
  getPaymentHistory,
};
