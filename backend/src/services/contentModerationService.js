const GeneratedVideo = require('../models/GeneratedVideo');
const ContentRequest = require('../models/ContentRequest');
const logger = require('../utils/logger');

class ContentModerationService {
  constructor() {
    this.moderationRules = {
      prohibitedTopics: [
        'violence', 'hate speech', 'nudity', 'illegal activities',
        'harmful content', 'discrimination', 'misinformation'
      ],
      contentCategories: {
        educational: ['science', 'technology', 'history', 'math', 'language'],
        entertainment: ['gaming', 'music', 'comedy', 'lifestyle'],
        documentary: ['nature', 'travel', 'culture', 'society'],
      },
      languageFilters: ['offensive', 'inappropriate', 'harmful'],
    };
  }

  // Moderate content request
  async moderateContentRequest(request) {
    try {
      const topic = request.topic.toLowerCase();
      
      // Check for prohibited topics
      const isProhibited = this.moderationRules.prohibitedTopics.some(
        prohibited => topic.includes(prohibited)
      );

      if (isProhibited) {
        return {
          approved: false,
          reason: 'Content topic violates community guidelines',
          notes: `Topic "${request.topic}" contains prohibited content`,
        };
      }

      // Additional checks can be added here
      // For example, checking against external moderation APIs

      return {
        approved: true,
        reason: 'Content approved',
        notes: 'Content passed all moderation checks',
      };
    } catch (error) {
      logger.error(`Content moderation error: ${error.message}`);
      return {
        approved: false,
        reason: 'Moderation error',
        notes: error.message,
      };
    }
  }

  // Moderate generated video
  async moderateGeneratedVideo(videoId) {
    try {
      const video = await GeneratedVideo.findById(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      // This would typically involve calling an external moderation service
      // For now, we'll implement basic checks

      const request = await ContentRequest.findById(video.requestId);
      if (!request) {
        throw new Error('Associated content request not found');
      }

      const moderationResult = await this.moderateContentRequest(request);

      video.moderationStatus = moderationResult.approved ? 'approved' : 'rejected';
      video.moderationNotes = moderationResult.notes;
      await video.save();

      return moderationResult;
    } catch (error) {
      logger.error(`Video moderation error: ${error.message}`);
      throw error;
    }
  }

  // Update moderation rules
  updateModerationRules(newRules) {
    this.moderationRules = { ...this.moderationRules, ...newRules };
  }

  // Get moderation statistics
  async getModerationStats() {
    const totalVideos = await GeneratedVideo.countDocuments();
    const approvedVideos = await GeneratedVideo.countDocuments({ moderationStatus: 'approved' });
    const rejectedVideos = await GeneratedVideo.countDocuments({ moderationStatus: 'rejected' });

    return {
      total: totalVideos,
      approved: approvedVideos,
      rejected: rejectedVideos,
      approvalRate: totalVideos > 0 ? (approvedVideos / totalVideos) * 100 : 0,
    };
  }
}

module.exports = new ContentModerationService();
