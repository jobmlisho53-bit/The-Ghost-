const GeneratedVideo = require('../models/GeneratedVideo');
const ContentRequest = require('../models/ContentRequest');
const logger = require('../utils/logger');

class VideoGenerationService {
  constructor() {
    this.generationQueue = [];
    this.processingQueue = new Set();
    this.maxConcurrent = 5; // Maximum concurrent generations
  }

  // Add request to generation queue
  async addToQueue(requestId) {
    try {
      const request = await ContentRequest.findById(requestId);
      if (!request) {
        throw new Error('Content request not found');
      }

      // Add to queue with priority
      this.generationQueue.push({
        requestId,
        priority: request.priority,
        timestamp: Date.now(),
      });

      // Sort queue by priority and timestamp
      this.generationQueue.sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return a.timestamp - b.timestamp; // FIFO for same priority
      });

      logger.info(`Added request ${requestId} to generation queue`);

      // Process queue if we have capacity
      this.processQueue();

      return true;
    } catch (error) {
      logger.error(`Failed to add to queue: ${error.message}`);
      throw error;
    }
  }

  // Process generation queue
  async processQueue() {
    try {
      // Process items while we have capacity and items in queue
      while (
        this.processingQueue.size < this.maxConcurrent &&
        this.generationQueue.length > 0
      ) {
        const item = this.generationQueue.shift();
        
        if (!this.processingQueue.has(item.requestId)) {
          this.processingQueue.add(item.requestId);
          this.processItem(item.requestId);
        }
      }
    } catch (error) {
      logger.error(`Queue processing error: ${error.message}`);
    }
  }

  // Process individual queue item
  async processItem(requestId) {
    try {
      // This would typically call the AI service
      // For now, we'll simulate the process
      logger.info(`Processing generation for request ${requestId}`);

      // Simulate generation time
      await this.delay(5000); // 5 seconds simulation

      // Update request status
      const request = await ContentRequest.findById(requestId);
      if (request) {
        request.status = 'completed';
        
        // Create mock video (in real implementation, this would come from AI service)
        const mockVideo = await GeneratedVideo.create({
          requestId: request._id,
          title: request.topic,
          url: `https://example.com/videos/${request._id}.mp4`,
          thumbnailUrl: `https://example.com/thumbnails/${request._id}.jpg`,
          duration: request.duration,
          resolution: { width: 1280, height: 720 },
          quality: '720p',
          aiMeta: {
            modelUsed: 'mock-ai-model',
            generationTime: new Date(),
            processingSteps: ['script-generation', 'video-synthesis', 'post-processing'],
          },
          moderationStatus: 'pending',
        });

        request.video = mockVideo._id;
        await request.save();
      }

      logger.info(`Completed generation for request ${requestId}`);
    } catch (error) {
      logger.error(`Generation failed for request ${requestId}: ${error.message}`);
      
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
    } finally {
      // Remove from processing queue and continue processing
      this.processingQueue.delete(requestId);
      this.processQueue();
    }
  }

  // Get queue status
  getQueueStatus() {
    return {
      pending: this.generationQueue.length,
      processing: this.processingQueue.size,
      maxConcurrent: this.maxConcurrent,
      queue: this.generationQueue,
    };
  }

  // Simulate delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cancel generation request
  async cancelGeneration(requestId) {
    // Remove from queue
    this.generationQueue = this.generationQueue.filter(item => item.requestId !== requestId);
    
    // Remove from processing if currently processing
    this.processingQueue.delete(requestId);

    // Update request status
    const request = await ContentRequest.findById(requestId);
    if (request) {
      request.status = 'cancelled';
      await request.save();
    }

    return true;
  }
}

module.exports = new VideoGenerationService();
