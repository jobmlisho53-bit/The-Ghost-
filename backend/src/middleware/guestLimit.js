const asyncHandler = require('express-async-handler');
const ContentRequest = require('../models/ContentRequest');
const logger = require('../utils/logger');

// Middleware to limit guest video generations
const guestLimit = asyncHandler(async (req, res, next) => {
  // Check if user is authenticated
  if (req.user && req.user._id) {
    // Authenticated user, no limit
    return next();
  }

  // Check if this is a guest user
  const isGuest = req.headers['x-guest-user'];
  if (!isGuest) {
    // Not a guest, proceed normally
    return next();
  }

  // Get guest identifier from IP or session
  const guestId = req.ip || req.session?.id || 'unknown';
  
  // Calculate today's date range
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Count video requests for this guest today
  const todayRequests = await ContentRequest.countDocuments({
    guestId: guestId,
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  // Limit: 3 generations per day for guests
  const DAILY_LIMIT = 3;
  
  if (todayRequests >= DAILY_LIMIT) {
    logger.warn(`Guest ${guestId} exceeded daily generation limit of ${DAILY_LIMIT}`);
    return res.status(429).json({
      success: false,
      error: `Daily limit reached. Guests can only generate ${DAILY_LIMIT} videos per day. Please sign up for unlimited access.`
    });
  }

  // Add guest info to request for later use
  req.guestInfo = {
    id: guestId,
    generationCount: todayRequests + 1,
    limit: DAILY_LIMIT
  };

  next();
});

module.exports = guestLimit;
