

// backend/src/middleware/validation.middleware.js

const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors from express-validator.
 * If any validation errors are found, responds with 400 and error details.
 */
function validationMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors array
    const formatted = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: formatted,
      }
    });
  }
  next();
}

module.exports = validationMiddleware;