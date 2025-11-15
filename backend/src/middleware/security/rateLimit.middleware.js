const rateLimit = require('express-rate-limit');

// More generous rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: process.env.NODE_ENV === 'production' ? 500 : 2000, // 500 requests per minute in prod, 2000 in dev
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    // Skip rate limiting for health checks, auth, and WebSocket
    const skipPaths = ['/health', '/ws/', '/auth/', '/api-keys'];
    return skipPaths.some((path) => req.path.includes(path));
  },
  // Validate trust proxy - only trust Railway proxy headers
  validate: {
    trustProxy: false, // Disable validation error for Railway's reverse proxy
    xForwardedForHeader: false,
  },
  keyGenerator: (req) => {
    // Use a combination of IP and user ID if authenticated
    const userId = req.user?.id || 'anonymous';
    // Get the real IP from Railway's forwarded headers
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.ip ||
               req.connection.remoteAddress;
    return `${ip}-${userId}`;
  },
});

module.exports = limiter;
