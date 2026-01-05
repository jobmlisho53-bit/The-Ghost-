const express = require('express');
const { 
  requestContent, 
  getContentRequests, 
  getContentRequest,
  getTrendingTopics
} = require('../controllers/contentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/request').post(protect, requestContent);
router.route('/requests').get(protect, getContentRequests);
router.route('/:id').get(protect, getContentRequest);
router.route('/trending').get(getTrendingTopics);

module.exports = router;
