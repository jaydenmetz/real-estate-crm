const logger = require('../../utils/logger');

// Enhanced error logging middleware
const errorLogging = (err, req, res, next) => {
  // Generate unique error ID
  const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Collect detailed error information
  const errorDetails = {
    errorId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    params: req.params,
    body: req.body,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      origin: req.headers.origin,
      referer: req.headers.referer,
    },
    user: req.user?.id || 'anonymous',
    ip: req.ip,
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode || 500,
      type: err.constructor.name,
    },
  };

  // Log to console and file
  logger.error('Request Error', errorDetails);

  // Check if user is admin
  // Normalize role - it might be a string or an array
  const userRole = req.user ? (Array.isArray(req.user.role) ? req.user.role[0] : req.user.role) : null;
  const isAdmin = req.user && (userRole === 'admin' || userRole === 'system_admin');

  // Send detailed error in development or for admin users
  if (process.env.NODE_ENV === 'development' || isAdmin) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message,
        errorId,
        details: errorDetails,
        stack: isAdmin ? err.stack : undefined,
      },
    });
  } else {
    res.status(err.statusCode || 500).json({
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: 'An error occurred processing your request',
        errorId,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

// Request logging middleware
const requestLogging = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorLogging,
  requestLogging,
  asyncHandler,
};
