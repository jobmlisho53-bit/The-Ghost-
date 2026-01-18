const express = require('express');
const { protect } = require('../middleware/auth');
const guestLimit = require('../middleware/guestLimit');
const {
  createContentRequest,
  getContentRequests,
  getTrendingTopics,
  getGeneratedVideo
} = require('../controllers/contentController');

const router = express.Router();

// Apply guest limit middleware to video request endpoint
router.route('/request')
  .post(guestLimit, protect, createContentRequest);

// Apply auth protection to user's requests
router.route('/requests')
  .get(protect, getContentRequests);

// Public endpoint for trending topics
router.route('/trending')
  .get(getTrendingTopics);

// Private endpoint for video details
router.route('/video/:id')
  .get(protect, getGeneratedVideo);

module.exports = router;
