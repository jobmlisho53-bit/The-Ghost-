const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.NODE_ENV === 'test' 
        ? process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/ghost_creators_test'
        : process.env.MONGODB_URI || 'mongodb://localhost:27017/ghost_creators'
    );

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
