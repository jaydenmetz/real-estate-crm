const rateLimit = require('express-rate-limit');

// Much more generous rate limiting for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests per minute in dev
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and WebSocket
    return req.path === '/health' || req.path.includes('/ws/');
  }
});

module.exports = limiter;