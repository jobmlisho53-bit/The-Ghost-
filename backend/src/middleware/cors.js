const cors = require('cors');

const corsOptions = {
  origin: [
    'https://the-ghost-seven.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    process.env.FRONTEND_URL || 'https://the-ghost-seven.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'X-Guest-User'
  ]
};

module.exports = cors(corsOptions);
