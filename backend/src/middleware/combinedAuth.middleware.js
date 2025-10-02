const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const ApiKeyService = require('../services/apiKey.service');

/**
 * Combined authentication middleware that accepts either JWT token or API key
 */
const authenticateAny = async (req, res, next) => {
  try {
    // First, check for API key
    const apiKey = req.headers['x-api-key'] || req.headers['api-key'];

    if (apiKey) {
      // Validate API key
      const userData = await ApiKeyService.validateApiKey(apiKey);

      if (userData) {
        // Attach user info to request
        req.user = {
          id: userData.userId,
          email: userData.email,
          username: userData.username,
          name: `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          teamId: userData.teamId,
          teamName: userData.teamName,
          apiKeyId: userData.apiKeyId,
          permissions: userData.permissions,
          authMethod: 'api_key',
        };

        // Log API key usage (async, don't wait)
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        ApiKeyService.logApiKeyUsage(
          userData.apiKeyId,
          req.originalUrl,
          req.method,
          ipAddress,
          userAgent,
        ).catch((err) => console.error('Failed to log API key usage:', err));

        return next();
      }
    }

    // If no API key or invalid API key, check for JWT token
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        // Verify token using environment variable
        const jwtSecret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, jwtSecret);

        // Get user from database
        const userQuery = `
          SELECT
            u.id,
            u.email,
            u.username,
            u.first_name,
            u.last_name,
            u.role,
            u.team_id,
            t.name as team_name
          FROM users u
          LEFT JOIN teams t ON u.team_id = t.id
          WHERE u.id = $1 AND u.is_active = true
        `;

        const userResult = await pool.query(userQuery, [decoded.id || decoded.userId]);

        if (userResult.rows.length === 0) {
          return res.status(401).json({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found or inactive',
            },
          });
        }

        const user = userResult.rows[0];

        // Attach user to request
        req.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          name: `${user.first_name} ${user.last_name}`,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          teamId: user.team_id,
          teamName: user.team_name,
          authMethod: 'jwt',
        };

        return next();
      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid authentication token',
            },
          });
        }
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            error: {
              code: 'TOKEN_EXPIRED',
              message: 'Authentication token has expired',
            },
          });
        }
        throw error;
      }
    }

    // No valid authentication found
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_AUTH',
        message: 'Authentication required. Please provide either an API key or JWT token.',
      },
    });
  } catch (error) {
    console.error('Authentication error details:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: `Authentication failed: ${error.message}`,
      },
    });
  }
};

module.exports = {
  authenticateAny,
};
