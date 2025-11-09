const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// JWT Secret Configuration
// MUST be set in environment - no fallback for security
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required');
}

const jwtSecret = process.env.JWT_SECRET;
// // console.log('✅ Using JWT_SECRET from environment variable');

/**
 * Authenticate user via JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_AUTH_TOKEN',
          message: 'No authentication token provided',
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token with configured secret
      const decoded = jwt.verify(token, jwtSecret);

      // Get user from database
      const userQuery = `
        SELECT id, email, first_name, last_name, role, is_active
        FROM users
        WHERE id = $1
      `;

      const userResult = await pool.query(userQuery, [decoded.id]);

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      const user = userResult.rows[0];

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_DISABLED',
            message: 'Account has been disabled',
          },
        });
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Authentication token has expired',
          },
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid authentication token',
          },
        });
      }

      throw error;
    }
  } catch (error) {
    console.error('Authentication error:', error);
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
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without user
    req.user = null;
    return next();
  }

  // If token is provided, validate it
  authenticate(req, res, next);
};

/**
 * Require specific roles
 * Handles both string and array role formats
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }

  // Handle both string and array role formats
  const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];

  // Check if user has any of the allowed roles
  const hasRole = userRoles.some(role => allowedRoles.includes(role));

  if (!hasRole) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      },
    });
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
};
