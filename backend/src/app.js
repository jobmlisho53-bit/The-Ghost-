const express = require('express');
const cors = require('./middleware/cors'); // Use our custom CORS middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Initialize Passport
require('./config/passport');

// Routes
const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/contentRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Security middleware
app.use(helmet());

// Apply CORS middleware
app.use(cors);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// API routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/auth', oauthRoutes); // OAuth routes
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ghost Creators API Server', 
    status: 'operational',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      content: '/api/v1/content',
      payments: '/api/v1/payments'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API available at http://localhost:${PORT}/api/v1`);
  logger.info(`Health check at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = app;
