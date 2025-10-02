const {
  body, param, query, validationResult,
} = require('express-validator');
const validator = require('validator');

const escrowValidationRules = () => [
  body('property_address').trim().escape().isLength({ min: 1, max: 255 }),
  body('city').trim().escape().isLength({ min: 1, max: 100 }),
  body('state').trim().escape().isLength({ min: 2, max: 2 }),
  body('zip_code').trim().escape().matches(/^\d{5}(-\d{4})?$/),
  body('purchase_price').isNumeric().toFloat(),
  body('escrow_status').isIn(['Active', 'Pending', 'Closed', 'Cancelled', 'Archived']),
  body('closing_date').isISO8601().toDate(),
  body('escrow_number').optional().trim().escape()
    .isLength({ max: 50 }),
  body('earnest_money_amount').optional().isNumeric().toFloat(),
  body('inspection_period_days').optional().isInt({ min: 0, max: 365 }),
];

const clientValidationRules = () => [
  body('first_name').trim().escape().isLength({ min: 1, max: 100 }),
  body('last_name').trim().escape().isLength({ min: 1, max: 100 }),
  body('email').trim().normalizeEmail().isEmail(),
  body('phone').optional().trim().isMobilePhone('any'),
  body('address').optional().trim().escape()
    .isLength({ max: 255 }),
  body('city').optional().trim().escape()
    .isLength({ max: 100 }),
  body('state').optional().trim().escape()
    .isLength({ max: 2 }),
  body('zip').optional().trim().matches(/^\d{5}(-\d{4})?$/),
];

const listingValidationRules = () => [
  body('property_address').trim().escape().isLength({ min: 1, max: 255 }),
  body('city').trim().escape().isLength({ min: 1, max: 100 }),
  body('state').trim().escape().isLength({ min: 2, max: 2 }),
  body('zip_code').trim().escape().matches(/^\d{5}(-\d{4})?$/),
  body('price').isNumeric().toFloat(),
  body('status').isIn(['Active', 'Pending', 'Sold', 'Expired', 'Withdrawn']),
  body('bedrooms').optional().isInt({ min: 0, max: 20 }),
  body('bathrooms').optional().isFloat({ min: 0, max: 20 }),
  body('square_feet').optional().isInt({ min: 0 }),
  body('lot_size').optional().isFloat({ min: 0 }),
  body('year_built').optional().isInt({ min: 1800, max: new Date().getFullYear() + 1 }),
];

const leadValidationRules = () => [
  body('first_name').trim().escape().isLength({ min: 1, max: 100 }),
  body('last_name').trim().escape().isLength({ min: 1, max: 100 }),
  body('email').trim().normalizeEmail().isEmail(),
  body('phone').optional().trim().isMobilePhone('any'),
  body('source').trim().escape().isLength({ min: 1, max: 50 }),
  body('status').isIn(['New', 'Contacted', 'Qualified', 'Converted', 'Lost']),
  body('notes').optional().trim().escape()
    .isLength({ max: 5000 }),
];

const idValidationRules = () => [
  param('id').isUUID().withMessage('Invalid ID format'),
];

const paginationValidationRules = () => [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['asc', 'desc']),
  query('sortBy').optional().trim().escape(),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    field: err.param,
    message: err.msg,
  }));

  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: extractedErrors,
    },
  });
};

const sanitizeRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key]);
      }
    });
  }
  next();
};

module.exports = {
  escrowValidationRules,
  clientValidationRules,
  listingValidationRules,
  leadValidationRules,
  idValidationRules,
  paginationValidationRules,
  validate,
  sanitizeRequestBody,
};
