const { createClient } = require('redis');
const logger = require('../utils/logger');

let redisClient;

async function initializeRedis() {
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
}

function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

module.exports = {
  initializeRedis,
  getRedisClient
};
