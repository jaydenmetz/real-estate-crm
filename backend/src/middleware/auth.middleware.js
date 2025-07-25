const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

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
          message: 'No authentication token provided'
        }
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '69f1e69d189afcf71dbdba8b7fa4668566ba5491a');
      
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
            message: 'User not found'
          }
        });
      }
      
      const user = userResult.rows[0];
      
      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_DISABLED',
            message: 'Account has been disabled'
          }
        });
      }
      
      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      };
      
      next();
      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Authentication token has expired'
          }
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid authentication token'
          }
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
        message: 'Authentication failed'
      }
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
 */
const requireRole = (...allowedRoles) => {
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
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
        }
      });
    }
    
    next();
  };
};

/**
 * Require specific permissions (future implementation)
 */
const requirePermission = (permission) => {
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
    
    // TODO: Implement permission checking
    // For now, just check if user is authenticated
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission
};