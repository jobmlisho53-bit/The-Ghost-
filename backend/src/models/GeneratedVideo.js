const mongoose = require('mongoose');

const generatedVideoSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentRequest',
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Video URL is required'],
  },
  thumbnailUrl: {
    type: String,
  },
  duration: {
    type: Number, // in seconds
  },
  size: {
    type: Number, // in bytes
  },
  resolution: {
    width: Number,
    height: Number,
  },
  format: {
    type: String,
    default: 'mp4',
  },
  quality: {
    type: String,
    enum: ['480p', '720p', '1080p', '4k'],
    default: '720p',
  },
  aiMetadata: {
    modelUsed: String,
    generationTime: Date,
    processingSteps: [String],
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  moderationNotes: String,
  views: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
generatedVideoSchema.index({ requestId: 1 });
generatedVideoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GeneratedVideo', generatedVideoSchema);
