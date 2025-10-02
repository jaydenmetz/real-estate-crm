const { authenticate } = require('./auth.middleware');
const { authenticateApiKey } = require('./apiKey.middleware');

/**
 * Combined Authentication Middleware
 * Accepts either JWT tokens OR API keys
 */
const authenticateAny = async (req, res, next) => {
  // Check for API key first (X-API-Key header)
  const apiKey = req.headers['x-api-key'];
  
  if (apiKey) {
    // Use API key authentication
    return authenticateApiKey(req, res, next);
  }
  
  // Fall back to JWT authentication
  return authenticate(req, res, next);
};

module.exports = {
  authenticateAny,
};
