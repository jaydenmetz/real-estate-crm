const { createClient } = require('redis');
const logger = require('../utils/logger');

let redisClient;

async function initializeRedis() {
  // Make Redis optional - if no REDIS_URL, skip initialization
  if (!process.env.REDIS_URL) {
    logger.warn('REDIS_URL not found, Redis features will be disabled');
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    return null;
  }
}

function getRedisClient() {
  // Return null if Redis is not available instead of throwing
  return redisClient || null;
}

module.exports = {
  initializeRedis,
  getRedisClient
};
