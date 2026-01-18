const Queue = require('bull');
const aiService = require('./aiService');
const logger = require('../utils/logger');

// Create a queue for video generation tasks
const videoQueue = new Queue('video generation', {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    password: process.env.REDIS_PASSWORD || ''
  }
});

// Process video generation jobs
videoQueue.process('generate', async (job) => {
  const { requestId } = job.data;
  logger.info(`Processing video generation job for request ${requestId}`);
  
  try {
    const result = await aiService.processContentRequest(requestId);
    logger.info(`Video generation completed for request ${requestId}`);
    return result;
  } catch (error) {
    logger.error(`Video generation failed for request ${requestId}: ${error.message}`);
    throw error;
  }
});

// Add a job to the queue
const addToQueue = (requestId) => {
  return videoQueue.add('generate', { requestId }, {
    attempts: 3,
    backoff: 'exponential',
    timeout: 300000, // 5 minutes timeout
    delay: 1000 // 1 second delay before processing
  });
};

// Listen for events
videoQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

videoQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed with error: ${err.message}`);
});

module.exports = { videoQueue, addToQueue };
