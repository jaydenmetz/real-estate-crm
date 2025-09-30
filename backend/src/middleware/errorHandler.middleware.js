// backend/src/middleware/errorHandler.js
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  const status = err.status || err.statusCode || 500;

  // TEMPORARY: Always show error message to debug production issue
  const message = err.message || 'An internal error occurred';

  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substring(7)}`
    },
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(status).json(errorResponse);
};