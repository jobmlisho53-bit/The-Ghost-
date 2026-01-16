const axios = require('axios');
const ContentRequest = require('../models/ContentRequest');
const GeneratedVideo = require('../models/GeneratedVideo');
const aiConfig = require('../config/ai-config');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.aiServiceUrl = aiConfig.aiServiceUrl;
    this.apiKey = aiConfig.aiApiKey;
  }

  // Generate content based on request
  async generateContent(requestId) {
    try {
      const request = await ContentRequest.findById(requestId);
      if (!request) {
        throw new Error('Content request not found');
      }

      // Update status to processing
      request.status = 'processing';
      await request.save();

      // Prepare AI service payload
      const payload = {
        topic: request.topic,
        duration: request.duration,
        style: request.style,
        language: request.language,
        request_id: request._id.toString(),
      };

      // Call AI service
      const response = await axios.post(`${this.aiServiceUrl}/generate`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 300000, // 5 minutes timeout
      });

      // Create generated video record
      const generatedVideo = await GeneratedVideo.create({
        requestId: request._id,
        title: request.topic,
        url: response.data.video_url,
        thumbnailUrl: response.data.thumbnail_url,
        duration: response.data.duration,
        aiMeta: response.data.ai_meta,
        moderationStatus: 'pending', // Needs moderation before publishing
      });

      // Update content request
      request.status = 'completed';
      request.video = generatedVideo._id;
      request.aiResponse = response.data;
      await request.save();

      logger.info(`Content generated successfully for request ${requestId}`);

      return generatedVideo;
    } catch (error) {
      logger.error(`AI generation failed for request ${requestId}: ${error.message}`);

      // Update request status to failed
      try {
        const request = await ContentRequest.findById(requestId);
        if (request) {
          request.status = 'failed';
          request.aiResponse = { error: error.message };
          await request.save();
        }
      } catch (updateError) {
        logger.error(`Failed to update request status: ${updateError.message}`);
      }

      throw error;
    }
  }

  // Generate content from request (wrapper function)
  async generateContentFromRequest(requestId) {
    return await this.generateContent(requestId);
  }

  // Get content generation status
  async getGenerationStatus(requestId) {
    try {
      const request = await ContentRequest.findById(requestId)
        .populate('video', 'url thumbnailUrl duration moderationStatus');

      if (!request) {
        throw new Error('Content request not found');
      }

      return {
        status: request.status,
        video: request.video,
        progress: this.calculateProgress(request),
      };
    } catch (error) {
      logger.error(`Failed to get generation status: ${error.message}`);
      throw error;
    }
  }

  // Calculate generation progress (mock implementation)
  calculateProgress(request) {
    if (request.status === 'pending') return 10;
    if (request.status === 'processing') return 50;
    if (request.status === 'completed') return 100;
    if (request.status === 'failed') return 0;
    return 0;
  }

  // Moderate content
  async moderateContent(videoId) {
    try {
      const video = await GeneratedVideo.findById(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      // Call moderation service
      const moderationResponse = await axios.post(`${this.aiServiceUrl}/moderate`, {
        video_url: video.url,
        request_id: video.requestId,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      video.moderationStatus = moderationResponse.data.approved ? 'approved' : 'rejected';
      video.moderationNotes = moderationResponse.data.notes;
      await video.save();

      // Update content request status if rejected
      if (video.moderationStatus === 'rejected') {
        const request = await ContentRequest.findById(video.requestId);
        if (request) {
          request.status = 'rejected';
          await request.save();
        }
      }

      return video.moderationStatus;
    } catch (error) {
      logger.error(`Content moderation failed: ${error.message}`);
      throw error;
    }
  }

  // Get trending topics from AI service
  async getTrendingTopics() {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/trends`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.data.trends;
    } catch (error) {
      logger.error(`Failed to get trending topics: ${error.message}`);
      // Return mock data as fallback
      return [
        { topic: 'AI and Machine Learning', count: 1250 },
        { topic: 'Blockchain Technology', count: 980 },
        { topic: 'Space Exploration', count: 870 },
      ];
    }
  }
}

module.exports = new AIService();
