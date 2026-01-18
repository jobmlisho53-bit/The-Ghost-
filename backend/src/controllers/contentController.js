const asyncHandler = require('express-async-handler');
const ContentRequest = require('../models/ContentRequest');
const User = require('../models/User');
const GeneratedVideo = require('../models/GeneratedVideo');
const { addToQueue } = require('../services/videoQueue');
const logger = require('../utils/logger');

// @desc    Create content request
// @route   POST /api/v1/content/request
// @access  Private (or limited for guests)
const createContentRequest = asyncHandler(async (req, res) => {
  const { topic, duration, style, language } = req.body;
  const userId = req.user ? req.user._id : null;
  const guestInfo = req.guestInfo;

  // Validate required fields
  if (!topic) {
    res.status(400);
    throw new Error('Topic is required');
  }

  // Determine if this is a guest request
  const isGuest = !userId;
  
  // If guest, add guest-specific tracking
  const contentRequestData = {
    user: userId,
    topic,
    duration: duration || 300, // Default 5 minutes
    style: style || 'educational',
    language: language || 'en',
    status: 'pending',
    cost: 0, // Free for now, but we could charge later
    priority: isGuest ? 1 : 2, // Lower priority for guests
  };

  // Add guest ID if applicable
  if (isGuest && guestInfo) {
    contentRequestData.guestId = guestInfo.id;
    contentRequestData.isGuest = true;
  }

  try {
    // Create content request
    const contentRequest = await ContentRequest.create(contentRequestData);

    // Update user's request count if authenticated
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: { contentRequests: contentRequest._id }
      });
    }

    // Log the request
    logger.info(`Content request created: ${contentRequest._id} by ${isGuest ? 'guest' : 'user ' + userId}`);

    // Add video generation to queue
    await addToQueue(contentRequest._id);

    res.status(201).json({
      success: true,
       contentRequest
    });
  } catch (error) {
    logger.error(`Error creating content request: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to create content request'
    });
  }
});

// @desc    Get user's content requests
// @route   GET /api/v1/content/requests
// @access  Private
const getContentRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const contentRequests = await ContentRequest.find({ user: userId })
      .populate('video', 'videoUrl thumbnailUrl duration status')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 requests

    res.status(200).json({
      success: true,
      count: contentRequests.length,
       contentRequests
    });
  } catch (error) {
    logger.error(`Error fetching content requests: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content requests'
    });
  }
});

// @desc    Get trending topics
// @route   GET /api/v1/content/trending
// @access  Public
const getTrendingTopics = asyncHandler(async (req, res) => {
  try {
    // This could be replaced with actual trending data from your DB
    // For now, we'll return some sample trending topics
    const trendingTopics = [
      { topic: 'AI Art Evolution', count: 1250 },
      { topic: 'Future Cities', count: 980 },
      { topic: 'Space Exploration', count: 870 },
      { topic: 'Quantum Physics', count: 750 },
      { topic: 'Cyberpunk Aesthetics', count: 620 }
    ];

    res.status(200).json({
      success: true,
       trendingTopics
    });
  } catch (error) {
    logger.error(`Error fetching trending topics: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending topics'
    });
  }
});

// @desc    Get generated video details
// @route   GET /api/v1/content/video/:id
// @access  Private
const getGeneratedVideo = asyncHandler(async (req, res) => {
  try {
    const video = await GeneratedVideo.findById(req.params.id)
      .populate('requestId', 'topic style language duration');

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    res.status(200).json({
      success: true,
       video
    });
  } catch (error) {
    logger.error(`Error fetching video: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video'
    });
  }
});

module.exports = {
  createContentRequest,
  getContentRequests,
  getTrendingTopics,
  getGeneratedVideo
};
