const mongoose = require('mongoose');

const generatedVideoSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentRequest',
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  duration: Number,
  aiModelUsed: String,
  aiSettings: mongoose.Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  fileSize: Number,
  resolution: String,
  creditsUsed: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GeneratedVideo', generatedVideoSchema);
