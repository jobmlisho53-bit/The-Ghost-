const asyncHandler = require('express-async-handler');
const ContentRequest = require('../models/ContentRequest');
const GeneratedVideo = require('../models/GeneratedVideo');
const User = require('../models/User');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

// @desc    Request AI-generated content
// @route   POST /api/v1/content/request
// @access  Private
const requestContent = asyncHandler(async (req, res) => {
  const { topic, duration, style, language } = req.body;

  if (!topic) {
    res.status(400);
    throw new Error('Topic is required');
  }

  const contentRequest = await ContentRequest.create({
    user: req.user._id,
    topic,
    duration: duration || 300, // default 5 minutes
    style: style || 'educational',
    language: language || 'en',
    status: 'pending',
  });

  // Trigger AI generation in background
  aiService.generateContent(contentRequest._id)
    .catch(err => logger.error(`AI generation failed: ${err.message}`));

  res.status(201).json({
    success: true,
    data: contentRequest,
  });
});

// @desc    Get user's content requests
// @route   GET /api/v1/content/requests
// @access  Private
const getContentRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const status = req.query.status;
  
  const filter = { user: req.user._id };
  if (status) {
    filter.status = status;
  }

  const total = await ContentRequest.countDocuments(filter);
  const requests = await ContentRequest.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('video', 'url thumbnailUrl duration');

  res.json({
    success: true,
    data: requests,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get specific content request
// @route   GET /api/v1/content/:id
// @access  Private
const getContentRequest = asyncHandler(async (req, res) => {
  const contentRequest = await ContentRequest.findById(req.params.id)
    .populate('video', 'url thumbnailUrl duration');

  if (!contentRequest) {
    res.status(404);
    throw new Error('Content request not found');
  }

  // Check if user owns the request
  if (contentRequest.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this content');
  }

  res.json({
    success: true,
    data: contentRequest,
  });
});

// @desc    Get trending topics
// @route   GET /api/v1/content/trending
// @access  Public
const getTrendingTopics = asyncHandler(async (req, res) => {
  // This would typically come from an external API or analytics data
  // For now, returning mock data
  const trendingTopics = [
    { topic: 'AI and Machine Learning', count: 1250 },
    { topic: 'Blockchain Technology', count: 980 },
    { topic: 'Space Exploration', count: 870 },
    { topic: 'Climate Change Solutions', count: 760 },
    { topic: 'Quantum Computing', count: 650 },
  ];

  res.json({
    success: true,
    data: trendingTopics,
  });
});

module.exports = {
  requestContent,
  getContentRequests,
  getContentRequest,
  getTrendingTopics,
};
