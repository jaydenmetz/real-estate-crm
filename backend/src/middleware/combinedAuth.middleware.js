const { authenticate } = require('./auth.middleware');
const { authenticateApiKey } = require('./apiKey.middleware');

/**
 * Combined Authentication Middleware
 * Accepts either JWT tokens OR API keys via Authorization: Bearer header
 *
 * Format Detection:
 * - JWT tokens: Start with "eyJ" (base64 encoded JSON header)
 * - API keys: 64-character hexadecimal strings
 *
 * Also supports legacy X-API-Key header for backwards compatibility
 */
const authenticateAny = async (req, res, next) => {
  // Check for legacy X-API-Key header (backwards compatibility)
  const legacyApiKey = req.headers['x-api-key'];

  if (legacyApiKey) {
    // Temporarily set it in Authorization header for apiKey middleware
    req.headers.authorization = `Bearer ${legacyApiKey}`;
    return authenticateApiKey(req, res, next);
  }

  // Check for Authorization: Bearer header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next); // Will fail with proper error
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Detect token type by format:
  // - JWT tokens start with 'eyJ' (base64 encoded JSON: {"alg":...})
  // - API keys are 64-character hex strings (only 0-9, a-f)
  const isJwt = token.startsWith('eyJ');
  const isApiKey = /^[a-f0-9]{64}$/i.test(token);

  if (isApiKey) {
    // Use API key authentication
    return authenticateApiKey(req, res, next);
  }

  if (isJwt) {
    // Use JWT authentication
    return authenticate(req, res, next);
  }

  // Invalid token format
  return res.status(401).json({
    success: false,
    error: {
      code: 'INVALID_TOKEN_FORMAT',
      message: 'Authentication token format is invalid. Expected JWT or API key.',
    },
  });
};

module.exports = {
  authenticateAny,
};
