// backend/src/middleware/auth.middleware.js

// Simple authentication check
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  // TODO: verify token or session, then attach user info to req.user
  next();
}

// Authorization factory
function requirePermission(permission) {
  return (req, res, next) => {
    // TODO: check req.user.permissions for the required permission
    // e.g. if (!req.user.permissions.includes(permission)) { … }
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, requirePermission };