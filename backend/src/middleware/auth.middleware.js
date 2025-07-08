// TEMPORARY: Mock authentication for development
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
  // Mock user data for development
  req.user = {
    id: 'dev-user-123',
    role: 'master', 
    email: 'dev@example.com',
    name: 'Development User'
  };
  
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    next(); // Always allow access in development
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    next(); // Always allow access in development
  };
};

module.exports = {
  authenticate,
  requireRole,
  requirePermission
};