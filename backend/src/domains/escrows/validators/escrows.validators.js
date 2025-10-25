const { body, param } = require('express-validator');

/**
 * Validation rules for creating a new escrow
 */
const createEscrowRules = () => [
  body('propertyAddress')
    .trim()
    .notEmpty()
    .withMessage('Property address is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Property address must be between 1 and 255 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be 2 characters'),

  body('zipCode')
    .optional()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid ZIP code format'),

  body('purchasePrice')
    .optional()
    .isNumeric()
    .withMessage('Purchase price must be a number')
    .toFloat(),

  body('escrowStatus')
    .optional()
    .isIn(['Active', 'Pending', 'Closed', 'Cancelled'])
    .withMessage('Invalid escrow status'),

  body('closingDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid closing date format')
    .toDate(),

  body('acceptanceDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid acceptance date format')
    .toDate(),

  body('earnestMoneyDeposit')
    .optional()
    .isNumeric()
    .withMessage('Earnest money deposit must be a number')
    .toFloat(),

  body('commissionPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Commission percentage must be between 0 and 100'),

  body('netCommission')
    .optional()
    .isNumeric()
    .withMessage('Net commission must be a number')
    .toFloat(),
];

/**
 * Validation rules for updating an escrow
 */
const updateEscrowRules = () => [
  body('propertyAddress')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Property address must be between 1 and 255 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be 2 characters'),

  body('zipCode')
    .optional()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid ZIP code format'),

  body('purchasePrice')
    .optional()
    .isNumeric()
    .withMessage('Purchase price must be a number')
    .toFloat(),

  body('escrowStatus')
    .optional()
    .isIn(['Active', 'Pending', 'Closed', 'Cancelled'])
    .withMessage('Invalid escrow status'),

  body('closingDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid closing date format')
    .toDate(),

  body('acceptanceDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid acceptance date format')
    .toDate(),

  body('earnestMoneyDeposit')
    .optional()
    .isNumeric()
    .withMessage('Earnest money deposit must be a number')
    .toFloat(),

  body('commissionPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Commission percentage must be between 0 and 100'),

  body('netCommission')
    .optional()
    .isNumeric()
    .withMessage('Net commission must be a number')
    .toFloat(),

  body('version')
    .optional()
    .isInt()
    .withMessage('Version must be an integer'),
];

/**
 * Validation rules for escrow ID parameter
 */
const escrowIdRules = () => [
  param('id')
    .notEmpty()
    .withMessage('Escrow ID is required'),
];

/**
 * Validation rules for batch delete
 */
const batchDeleteRules = () => [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs must be a non-empty array'),
];

module.exports = {
  createEscrowRules,
  updateEscrowRules,
  escrowIdRules,
  batchDeleteRules,
};
