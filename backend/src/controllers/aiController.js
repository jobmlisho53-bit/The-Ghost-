const asyncHandler = require('express-async-handler');
const ContentRequest = require('../models/ContentRequest');
const GeneratedVideo = require('../models/GeneratedVideo');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

// @desc    Generate content via AI service
// @route   POST /api/v1/ai/generate
// @access  Private (Internal)
const generateContent = asyncHandler(async (req, res) => {
  const { topic, duration, style, language, request_id } = req.body;

  if (!topic || !request_id) {
    res.status(400);
    throw new Error('Topic and request_id are required');
  }

  try {
    // This would typically call your AI service
    // For now, we'll simulate the process
    const generatedVideo = await aiService.generateContentFromRequest(request_id);

    res.status(200).json({
      success: true,
      data: generatedVideo,
    });
  } catch (error) {
    logger.error(`AI generation failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'AI generation failed',
    });
  }
});

// @desc    Get generation status
// @route   GET /api/v1/ai/status/:id
// @access  Private
const getGenerationStatus = asyncHandler(async (req, res) => {
  const requestId = req.params.id;

  try {
    const status = await aiService.getGenerationStatus(requestId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error(`Get generation status failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get generation status',
    });
  }
});

module.exports = {
  generateContent,
  getGenerationStatus,
};
