const ApiKeyService = require('../services/apiKey.service');
const SecurityEventService = require('../services/securityEvent.service');

/**
 * Authenticate requests using API Key
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    // Check for API key in header
    const apiKey = req.headers['x-api-key'] || req.headers['api-key'];

    if (!apiKey) {
      // No API key provided, skip to next middleware (might use JWT auth)
      return next();
    }

    // Validate API key
    const userData = await ApiKeyService.validateApiKey(apiKey);

    if (!userData) {
      // Log failed API key authentication (fire-and-forget)
      SecurityEventService.logEvent({
        eventType: 'api_key_used',
        eventCategory: 'api_key',
        severity: 'warning',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestPath: req.originalUrl,
        requestMethod: req.method,
        success: false,
        message: 'Invalid API key provided',
        metadata: { key_prefix: apiKey.substring(0, 8) },
      }).catch(console.error);

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid API key provided',
        },
      });
    }

    // Attach user info to request
    req.user = {
      id: userData.userId,
      email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      teamId: userData.teamId,
      teamName: userData.teamName,
      apiKeyId: userData.apiKeyId,
      scopes: userData.scopes || { all: ['read', 'write', 'delete'] },
      authMethod: 'api_key',
    };

    // Log API key usage (async, don't wait)
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    ApiKeyService.logApiKeyUsage(
      userData.apiKeyId,
      req.originalUrl,
      req.method,
      null, // Status code will be logged in response
      ipAddress,
      userAgent,
    ).catch(console.error);

    next();
  } catch (error) {
    console.error('API Key authentication error:', error.message, error.stack);

    if (error.message && error.message.includes('expired')) {
      // Log expired API key attempt (fire-and-forget)
      SecurityEventService.logEvent({
        eventType: 'api_key_expired',
        eventCategory: 'api_key',
        severity: 'warning',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestPath: req.originalUrl,
        requestMethod: req.method,
        success: false,
        message: error.message,
      }).catch(console.error);

      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_EXPIRED',
          message: error.message,
        },
      });
    }

    if (error.message.includes('deactivated')) {
      // Log deactivated API key attempt (fire-and-forget)
      SecurityEventService.logEvent({
        eventType: 'api_key_used',
        eventCategory: 'api_key',
        severity: 'warning',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestPath: req.originalUrl,
        requestMethod: req.method,
        success: false,
        message: error.message,
      }).catch(console.error);

      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_DEACTIVATED',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
      },
    });
  }
};

/**
 * Combined authentication middleware - supports both JWT and API Key
 */
const authenticate = async (req, res, next) => {
  // First try API key authentication
  const apiKey = req.headers['x-api-key'] || req.headers['api-key'];

  if (apiKey) {
    return authenticateApiKey(req, res, next);
  }

  // Then try JWT authentication
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Use existing JWT authentication
    const authMiddleware = require('./auth.middleware');
    return authMiddleware.authenticate(req, res, next);
  }

  // No authentication provided
  return res.status(401).json({
    success: false,
    error: {
      code: 'NO_AUTH_TOKEN',
      message: 'No authentication token provided',
    },
  });
};

/**
 * Check if user has required scope for resource and action
 * Modern scope-based authorization (replaces requirePermission)
 */
const requireScope = (resource, action) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }

  // JWT users bypass scope checks (have full access)
  if (req.user.authMethod !== 'api_key') {
    return next();
  }

  const scopes = req.user.scopes || {};

  // Check if user has 'all:action' scope (e.g., all:read)
  const hasAllScope = scopes.all && scopes.all.includes(action);

  // Check if user has 'resource:action' scope (e.g., clients:read)
  const hasResourceScope = scopes[resource] && scopes[resource].includes(action);

  if (!hasAllScope && !hasResourceScope) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_SCOPE',
        message: `API key missing required scope: ${resource}:${action}`,
        required_scope: `${resource}:${action}`,
      },
    });
  }

  next();
};

module.exports = {
  authenticateApiKey,
  authenticate,
  requireScope,
};
