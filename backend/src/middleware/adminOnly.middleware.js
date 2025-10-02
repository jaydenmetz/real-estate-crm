/**
 * Admin-Only Middleware
 * Restricts access to system admin users only
 */

const adminOnly = (req, res, next) => {
  // Must be authenticated first (by authenticate middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }

  // Check if user is system_admin
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required. This endpoint is restricted to system administrators.',
        userRole: req.user.role,
        requiredRole: 'system_admin',
      },
    });
  }

  // User is admin, proceed
  next();
};

module.exports = { adminOnly };
