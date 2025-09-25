const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per 15 minutes (more reasonable for API usage)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Allow 30 login attempts per 15 minutes (more reasonable for testing/development)
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Allow 30 requests per minute for sensitive operations
  message: 'Too many requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

const healthCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Allow 20 health checks per minute (for dashboard testing)
  message: 'Too many health check requests.',
  standardHeaders: true,
  legacyHeaders: false,
});

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "https://browser.sentry-cdn.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.sentry.io", "https://api.jaydenmetz.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  },
  crossOriginEmbedderPolicy: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  strictLimiter,
  healthCheckLimiter,
  helmet: helmetConfig
};