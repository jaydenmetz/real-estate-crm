const {
  body, query, param, validationResult,
} = require('express-validator');

/**
 * SQL Injection Prevention Middleware
 * Sanitizes and validates all user inputs to prevent SQL injection attacks
 */

/**
 * List of dangerous SQL keywords and patterns
 */
const SQL_BLACKLIST_PATTERNS = [
  /(\b)(DELETE|DROP|EXEC(UTE)?|INSERT|SELECT|UNION|UPDATE)(\b)/gi,
  /(\b)(ALTER|CREATE|TRUNCATE|REPLACE)(\b)/gi,
  /(--|#|\/\*|\*\/)/g, // SQL comments
  /(\bOR\b\s*\d+\s*=\s*\d+)/gi, // OR 1=1 patterns
  /(\bAND\b\s*\d+\s*=\s*\d+)/gi, // AND 1=1 patterns
  /(;|\||&&)/g, // Command chaining
  /(\bxp_|sp_|0x)/gi, // System stored procedures
  /<script/gi, // XSS attempts
];

/**
 * Check if input contains SQL injection patterns
 */
const containsSQLInjection = (input) => {
  if (typeof input !== 'string') return false;

  return SQL_BLACKLIST_PATTERNS.some((pattern) => pattern.test(input));
};

/**
 * Recursively sanitize object properties
 */
const sanitizeObject = (obj) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Check for SQL injection
      if (containsSQLInjection(value)) {
        throw new Error(`Potential SQL injection detected in field: ${key}`);
      }
      // Basic sanitization
      sanitized[key] = value
        .replace(/'/g, "''") // Escape single quotes
        .trim();
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => (typeof item === 'string' ? item.replace(/'/g, "''").trim() : item));
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Middleware to prevent SQL injection
 */
const preventSQLInjection = (req, res, next) => {
  try {
    // Check query parameters
    if (req.query && Object.keys(req.query).length > 0) {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string' && containsSQLInjection(value)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_INPUT',
              message: 'Invalid characters detected in query parameters',
              field: key,
            },
          });
        }
      }
    }

    // Check URL parameters
    if (req.params && Object.keys(req.params).length > 0) {
      for (const [key, value] of Object.entries(req.params)) {
        if (typeof value === 'string' && containsSQLInjection(value)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_INPUT',
              message: 'Invalid characters detected in URL parameters',
              field: key,
            },
          });
        }
      }
    }

    // Check body
    if (req.body && Object.keys(req.body).length > 0) {
      try {
        req.body = sanitizeObject(req.body);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: error.message,
          },
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
      },
    });
  }
};

/**
 * Validation rules for common fields
 */
const validationRules = {
  // ID validation - only alphanumeric and hyphens
  id: param('id')
    .isAlphanumeric('en-US', { ignore: '-_' })
    .withMessage('Invalid ID format'),

  // Email validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),

  // Username validation
  username: body('username')
    .isAlphanumeric('en-US', { ignore: '_-' })
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters, alphanumeric with _ or -'),

  // Password validation
  password: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),

  // Phone validation
  phone: body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid phone number'),

  // URL validation
  url: body('url')
    .optional()
    .isURL()
    .withMessage('Invalid URL format'),

  // Date validation
  date: body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

  // Pagination validation
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  // Sort validation
  sort: query('sort')
    .optional()
    .matches(/^[a-zA-Z_]+:(asc|desc)$/)
    .withMessage('Invalid sort format. Use field:asc or field:desc'),

  // Search validation
  search: query('search')
    .optional()
    .isLength({ max: 100 })
    .escape()
    .withMessage('Search query too long'),
};

/**
 * Middleware to validate request based on validation rules
 */
const validate = (rules) => async (req, res, next) => {
  // Apply validation rules
  await Promise.all(rules.map((rule) => rule.run(req)));

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array(),
      },
    });
  }

  next();
};

/**
 * Create parameterized query helper
 */
const createParameterizedQuery = (query, params) =>
  // This is a helper to ensure parameterized queries are used
  // The actual implementation should use your database library's parameterized query feature
  ({
    text: query,
    values: params,
  })
;

/**
 * Sanitize filename for uploads
 */
const sanitizeFilename = (filename) => filename
  .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters
  .replace(/\.\./g, '') // Prevent directory traversal
  .substring(0, 255) // Limit length
;

module.exports = {
  preventSQLInjection,
  validationRules,
  validate,
  createParameterizedQuery,
  sanitizeFilename,
  containsSQLInjection,
};
