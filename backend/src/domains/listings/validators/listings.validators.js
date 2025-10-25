const { body, param } = require('express-validator');

/**
 * Validation rules for creating a new listing
 */
const createListingRules = () => [
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

  body('listPrice')
    .notEmpty()
    .withMessage('List price is required')
    .isNumeric()
    .withMessage('List price must be a number')
    .toFloat(),

  body('listingStatus')
    .optional()
    .isIn(['Coming Soon', 'Active', 'Pending', 'Sold', 'Expired', 'Cancelled', 'Withdrawn'])
    .withMessage('Invalid listing status'),

  body('listingDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid listing date format')
    .toDate(),

  body('propertyType')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Property type must be 50 characters or less'),

  body('bedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Bedrooms must be between 0 and 20'),

  body('bathrooms')
    .optional()
    .isFloat({ min: 0, max: 20 })
    .withMessage('Bathrooms must be between 0 and 20'),

  body('squareFeet')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Square feet must be a positive integer'),

  body('lotSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lot size must be a positive number'),

  body('yearBuilt')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() + 1 })
    .withMessage(`Year built must be between 1800 and ${new Date().getFullYear() + 1}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or less'),

  body('listingCommission')
    .optional()
    .isNumeric()
    .withMessage('Listing commission must be a number')
    .toFloat(),

  body('buyerCommission')
    .optional()
    .isNumeric()
    .withMessage('Buyer commission must be a number')
    .toFloat(),
];

/**
 * Validation rules for updating a listing
 */
const updateListingRules = () => [
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

  body('listPrice')
    .optional()
    .isNumeric()
    .withMessage('List price must be a number')
    .toFloat(),

  body('listingStatus')
    .optional()
    .isIn(['Coming Soon', 'Active', 'Pending', 'Sold', 'Expired', 'Cancelled', 'Withdrawn'])
    .withMessage('Invalid listing status'),

  body('listingDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid listing date format')
    .toDate(),

  body('propertyType')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Property type must be 50 characters or less'),

  body('bedrooms')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Bedrooms must be between 0 and 20'),

  body('bathrooms')
    .optional()
    .isFloat({ min: 0, max: 20 })
    .withMessage('Bathrooms must be between 0 and 20'),

  body('squareFeet')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Square feet must be a positive integer'),

  body('lotSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lot size must be a positive number'),

  body('yearBuilt')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() + 1 })
    .withMessage(`Year built must be between 1800 and ${new Date().getFullYear() + 1}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or less'),

  body('listingCommission')
    .optional()
    .isNumeric()
    .withMessage('Listing commission must be a number')
    .toFloat(),

  body('buyerCommission')
    .optional()
    .isNumeric()
    .withMessage('Buyer commission must be a number')
    .toFloat(),
];

/**
 * Validation rules for status update
 */
const updateStatusRules = () => [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Coming Soon', 'Active', 'Pending', 'Sold', 'Expired', 'Cancelled', 'Withdrawn'])
    .withMessage('Invalid listing status'),
];

/**
 * Validation rules for listing ID parameter
 */
const listingIdRules = () => [
  param('id')
    .notEmpty()
    .withMessage('Listing ID is required'),
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
  createListingRules,
  updateListingRules,
  updateStatusRules,
  listingIdRules,
  batchDeleteRules,
};
