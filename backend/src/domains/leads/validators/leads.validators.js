const { body, param } = require('express-validator');

/**
 * Validation rules for creating a new lead
 */
const createLeadRules = () => [
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

  body('leadStatus')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Converted', 'Lost'])
    .withMessage('Invalid lead status'),

  body('leadSource')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Lead source must be between 1 and 50 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Notes must be 5000 characters or less'),

  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean'),
];

/**
 * Validation rules for updating a lead
 */
const updateLeadRules = () => [
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

  body('leadStatus')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Converted', 'Lost'])
    .withMessage('Invalid lead status'),

  body('leadSource')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Lead source must be between 1 and 50 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Notes must be 5000 characters or less'),

  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean'),
];

/**
 * Validation rules for status update
 */
const updateStatusRules = () => [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['New', 'Contacted', 'Qualified', 'Converted', 'Lost'])
    .withMessage('Invalid lead status'),
];

/**
 * Validation rules for lead ID parameter
 */
const leadIdRules = () => [
  param('id')
    .notEmpty()
    .withMessage('Lead ID is required'),
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
  createLeadRules,
  updateLeadRules,
  updateStatusRules,
  leadIdRules,
  batchDeleteRules,
};
