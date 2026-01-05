const redis = require('redis');
const logger = require('../utils/logger');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error(`Redis Client Error: ${err}`);
});

redisClient.connect();

module.exports = redisClient;
