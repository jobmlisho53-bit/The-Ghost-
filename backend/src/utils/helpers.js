// Helper functions for the application

// Generate unique ID
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format response
const formatResponse = (success, data, message = null) => {
  return {
    success,
    data,
    ...(message && { message }),
  };
};

// Validate email
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Calculate content generation cost
const calculateGenerationCost = (duration, quality, style) => {
  // Base cost calculation
  let cost = 0.1; // Base cost
  
  // Duration factor (longer videos cost more)
  cost += (duration / 60) * 0.05; // $0.05 per minute
  
  // Quality factor
  switch (quality) {
    case '1080p':
      cost *= 1.5;
      break;
    case '4k':
      cost *= 3;
      break;
    default:
      cost *= 1;
  }
  
  // Style factor
  switch (style) {
    case 'documentary':
      cost *= 1.2;
      break;
    case 'entertainment':
      cost *= 1.1;
      break;
    default:
      cost *= 1;
  }
  
  return Math.round(cost * 100) / 100; // Round to 2 decimal places
};

// Format duration (seconds to human readable)
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

// Get content category from topic
const getCategoryFromTopic = (topic) => {
  const topicLower = topic.toLowerCase();
  
  const categories = {
    technology: ['ai', 'machine learning', 'programming', 'software', 'tech', 'coding', 'robotics', 'blockchain'],
    science: ['science', 'physics', 'chemistry', 'biology', 'astronomy', 'research', 'experiment'],
    education: ['learning', 'study', 'course', 'tutorial', 'education', 'school', 'university'],
    entertainment: ['fun', 'game', 'music', 'movie', 'comedy', 'entertainment'],
    business: ['business', 'finance', 'marketing', 'economy', 'startup', 'entrepreneur'],
    health: ['health', 'fitness', 'medicine', 'nutrition', 'wellness'],
    lifestyle: ['lifestyle', 'travel', 'food', 'cooking', 'home', 'garden'],
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => topicLower.includes(keyword))) {
      return category;
    }
  }
  
  return 'general'; // default category
};

// Check if content is appropriate
const isContentAppropriate = (topic) => {
  const inappropriateKeywords = [
    'violence', 'hate', 'discrimination', 'illegal', 'harmful', 'inappropriate'
  ];
  
  const topicLower = topic.toLowerCase();
  return !inappropriateKeywords.some(keyword => topicLower.includes(keyword));
};

module.exports = {
  generateUniqueId,
  formatResponse,
  isValidEmail,
  isValidUrl,
  sanitizeInput,
  calculateGenerationCost,
  formatDuration,
  getCategoryFromTopic,
  isContentAppropriate,
};
