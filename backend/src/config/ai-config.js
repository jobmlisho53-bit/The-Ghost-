const aiConfig = {
  // AI Service Configuration
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  aiApiKey: process.env.AI_API_KEY,
  
  // Video Generation Settings
  videoGeneration: {
    defaultDuration: 300, // seconds
    maxDuration: 3600, // 1 hour max
    quality: '720p', // or '1080p'
    maxConcurrent: 10, // maximum concurrent generation requests
  },
  
  // Content Moderation Settings
  contentModeration: {
    enabled: true,
    strictness: 'medium', // 'strict', 'medium', 'lenient'
    autoReject: true,
  },
  
  // Model Configuration
  modelConfig: {
    textModel: 'gpt-4', // or equivalent
    videoModel: 'stable-video-diffusion', // or equivalent
    maxTokens: 4096,
    temperature: 0.7,
  },
  
  // API Limits
  apiLimits: {
    maxRequestsPerMinute: 100,
    maxContentLength: 10000, // characters
  }
};

module.exports = aiConfig;
