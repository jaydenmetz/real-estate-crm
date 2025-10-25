const { body, param } = require('express-validator');

/**
 * Validation rules for creating a new client
 */
const createClientRules = () => [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email format'),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),

  body('clientType')
    .optional()
    .isIn(['Buyer', 'Seller', 'Both'])
    .withMessage('Client type must be Buyer, Seller, or Both'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),

  body('addressStreet')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Street address must be 255 characters or less'),

  body('addressCity')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be 100 characters or less'),

  body('addressState')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be 2 characters'),

  body('addressZip')
    .optional()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid ZIP code format'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Notes must be 5000 characters or less'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

/**
 * Validation rules for updating a client
 */
const updateClientRules = () => [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email format'),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),

  body('clientType')
    .optional()
    .isIn(['Buyer', 'Seller', 'Both'])
    .withMessage('Client type must be Buyer, Seller, or Both'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),

  body('addressStreet')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Street address must be 255 characters or less'),

  body('addressCity')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be 100 characters or less'),

  body('addressState')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be 2 characters'),

  body('addressZip')
    .optional()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid ZIP code format'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Notes must be 5000 characters or less'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

/**
 * Validation rules for client ID parameter
 */
const clientIdRules = () => [
  param('id')
    .notEmpty()
    .withMessage('Client ID is required'),
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
  createClientRules,
  updateClientRules,
  clientIdRules,
  batchDeleteRules,
};
