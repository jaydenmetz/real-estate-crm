const ApiKeyService = require('../services/api.service.serviceKey.service');

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
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid API key provided'
        }
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
      permissions: userData.permissions,
      authMethod: 'api_key'
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
      userAgent
    ).catch(console.error);

    next();
  } catch (error) {
    console.error('API Key authentication error:', error.message, error.stack);
    
    if (error.message && error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_EXPIRED',
          message: error.message
        }
      });
    }
    
    if (error.message.includes('deactivated')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_DEACTIVATED',
          message: error.message
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed'
      }
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
      code: 'NO_AUTH',
      message: 'No authentication provided. Use API Key (X-API-Key header) or Bearer token (Authorization header)'
    }
  });
};

/**
 * Check if user has permission for specific resource and action
 */
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // If using JWT auth, allow all permissions (for now)
    if (req.user.authMethod !== 'api_key') {
      return next();
    }

    // Check API key permissions
    if (!ApiKeyService.hasPermission(req.user.permissions, resource, action)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `You do not have ${action} permission for ${resource}`
        }
      });
    }

    next();
  };
};

module.exports = {
  authenticateApiKey,
  authenticate,
  requirePermission
};