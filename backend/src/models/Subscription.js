const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: String,
    required: [true, 'Plan is required'],
    enum: ['free', 'premium', 'enterprise'],
    default: 'free',
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'past_due'],
    default: 'active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  stripeSubscriptionId: String,
  stripeCustomerId: String,
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer'],
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly',
  },
  monthlyQuota: {
    type: Number,
    default: 10, // Free tier: 10 requests per month
  },
  usedQuota: {
    type: Number,
    default: 0,
  },
  maxConcurrentRequests: {
    type: Number,
    default: 1, // Free tier: 1 concurrent request
  },
  videoQuality: {
    type: String,
    enum: ['480p', '720p', '1080p'],
    default: '480p',
  },
  features: {
    adFree: {
      type: Boolean,
      default: false,
    },
    earlyAccess: {
      type: Boolean,
      default: false,
    },
    priorityProcessing: {
      type: Boolean,
      default: false,
    },
    customStyles: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

// Index for efficient querying
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
