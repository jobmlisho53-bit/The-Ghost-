const express = require('express');
const { generateContent, getGenerationStatus } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Internal route for AI service communication
router.route('/generate').post(generateContent);
router.route('/status/:id').get(getGenerationStatus);

module.exports = router;
