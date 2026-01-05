const express = require('express');
const { createSubscription, cancelSubscription, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/subscribe').post(protect, createSubscription);
router.route('/cancel').post(protect, cancelSubscription);
router.route('/history').get(protect, getPaymentHistory);

module.exports = router;
