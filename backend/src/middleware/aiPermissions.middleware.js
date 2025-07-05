

// backend/src/middleware/aiPermissions.middleware.js

/**
 * Middleware for AI route protection.
 * Only allows users with appropriate roles to access AI endpoints.
 */

function aiPermissions(req, res, next) {
  // Ensure the request is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to access AI functionality'
      }
    });
  }

  // Only master, executive, and manager roles are allowed
  const { role } = req.user;
  const allowedRoles = ['master', 'executive', 'manager'];

  if (allowedRoles.includes(role)) {
    return next();
  }

  // Agents do not have direct access to AI orchestration endpoints
  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Insufficient permissions to access AI functionality'
    }
  });
}

module.exports = aiPermissions;