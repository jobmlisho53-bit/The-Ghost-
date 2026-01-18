const mongoose = require('mongoose');

const contentRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  duration: {
    type: Number,
    default: 300 // Duration in seconds
  },
  style: {
    type: String,
    default: 'educational',
    enum: ['educational', 'entertainment', 'documentary', 'animation', 'cinematic']
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneratedVideo'
  },
  cost: {
    type: Number,
    default: 0
  },
  priority: {
    type: Number,
    default: 1 // 1 for guest, 2 for regular user, 3 for premium
  },
  guestId: {
    type: String,
    sparse: true // For tracking guest requests
  },
  isGuest: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContentRequest', contentRequestSchema);
