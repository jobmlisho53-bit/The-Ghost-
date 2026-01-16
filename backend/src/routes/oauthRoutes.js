const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const router = express.Router();

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { session: false }), 
  async (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(user._id);
      
      // Set token in cookie or return in response
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}`);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// GitHub OAuth routes
router.get('/github', 
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback', 
  passport.authenticate('github', { session: false }), 
  async (req, res) => {
    try {
      const user = req.user;
      const token = generateToken(user._id);
      
      // Set token in cookie or return in response
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}`);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
