const express = require('express');
const { protect } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// @desc    Initiate M-Pesa STK Push
// @route   POST /api/v1/payments/mpesa/stkpush
// @access  Private
router.post('/mpesa/stkpush', protect, asyncHandler(async (req, res) => {
  const { phoneNumber, amount, accountReference, transactionDesc } = req.body;
  const userId = req.user._id;

  try {
    const result = await paymentService.initiateStkPush(
      phoneNumber,
      amount,
      accountReference || `GhostCreators-${userId}`,
      transactionDesc || 'Video Generation Credits'
    );

    res.status(200).json({
      success: true,
       result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    M-Pesa Callback webhook
// @route   POST /api/v1/payments/mpesa/callback
// @access  Public (M-Pesa will call this)
router.post('/mpesa/callback', asyncHandler(async (req, res) => {
  try {
    const result = await paymentService.handlePaymentWebhook(req.body);
    
    // Send success response to M-Pesa
    res.status(200).json({
      "ResultCode": 0,
      "ResultDesc": "Confirmation Received Successfully"
    });
  } catch (error) {
    logger.error('M-Pesa callback error:', error.message);
    res.status(200).json({
      "ResultCode": 1,
      "ResultDesc": "Callback Error"
    });
  }
}));

// @desc    Get user's payment history
// @route   GET /api/v1/payments/history
// @access  Private
router.get('/history', protect, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('paymentHistory');
    
    res.status(200).json({
      success: true,
      paymentHistory: user.paymentHistory || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

module.exports = router;
