const mongoose = require('mongoose');

const contentRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    maxlength: [200, 'Topic cannot be more than 200 characters'],
  },
  duration: {
    type: Number,
    default: 300, // seconds
    min: [10, 'Duration must be at least 10 seconds'],
    max: [3600, 'Duration cannot exceed 1 hour'],
  },
  style: {
    type: String,
    enum: ['educational', 'entertainment', 'documentary', 'tutorial', 'explainer'],
    default: 'educational',
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'hi', 'ar'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'rejected'],
    default: 'pending',
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneratedVideo',
  },
  aiResponse: {
    type: Object, // To store AI model response details
    default: {},
  },
  cost: {
    type: Number, // Cost of generating this content
    default: 0,
  },
  priority: {
    type: Number,
    default: 1, // Higher number = higher priority
  },
}, {
  timestamps: true,
});

// Index for efficient querying
contentRequestSchema.index({ user: 1, createdAt: -1 });
contentRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContentRequest', contentRequestSchema);
