const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { redisClient } = require('../config/redis');

/**
 * Create rate limiter with different limits based on authentication type
 */
const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    standardLimit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    skipSuccessfulRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  };

  // Use Redis if available, otherwise fall back to memory store
  const store = redisClient?.isOpen ? new RedisStore({
    client: redisClient,
    prefix: 'rl:',
  }) : undefined;

  return rateLimit({
    windowMs: options.windowMs || defaults.windowMs,
    max: async (req) => {
      // Different limits based on authentication type
      if (req.user?.role === 'admin' || req.user?.role === 'system_admin') {
        return 1000; // Higher limit for admins
      }
      if (req.apiKey) {
        return 500; // API key users get more requests
      }
      if (req.user) {
        return 200; // Authenticated users
      }
      return options.max || defaults.standardLimit; // Anonymous users
    },
    message: 'Too many requests, please try again later.',
    standardHeaders: defaults.standardHeaders,
    legacyHeaders: defaults.legacyHeaders,
    store,
    keyGenerator: (req) => {
      // Create unique key based on authentication method
      if (req.apiKey) {
        return `api_${req.apiKey.id}`;
      }
      if (req.user) {
        return `user_${req.user.id}`;
      }
      // Fall back to IP address for anonymous users
      return req.ip;
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: req.rateLimit.resetTime
        }
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/v1/health';
    }
  });
};

/**
 * Strict rate limiter for sensitive endpoints
 */
const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // Only 5 requests per 15 minutes
});

/**
 * Auth rate limiter for login/register endpoints
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // 10 auth attempts per 15 minutes
});

/**
 * API rate limiter for general API endpoints
 */
const apiRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 100 // Dynamic based on auth type
});

/**
 * Search rate limiter for expensive search operations
 */
const searchRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 30 // 30 searches per minute
});

module.exports = {
  createRateLimiter,
  strictRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  searchRateLimiter
};