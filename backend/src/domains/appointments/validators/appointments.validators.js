const { body, param } = require('express-validator');

/**
 * Validation rules for creating a new appointment
 */
const createAppointmentRules = () => [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),

  body('appointmentDate')
    .notEmpty()
    .withMessage('Appointment date is required')
    .isISO8601()
    .withMessage('Invalid appointment date format')
    .toDate(),

  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM format'),

  body('endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM format'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must be 255 characters or less'),

  body('appointmentType')
    .optional()
    .isIn(['Property Showing', 'Consultation', 'Open House', 'Inspection', 'Meeting', 'Other'])
    .withMessage('Invalid appointment type'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be 2000 characters or less'),

  body('status')
    .optional()
    .isIn(['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'])
    .withMessage('Invalid status'),

  body('clientId')
    .optional()
    .isUUID()
    .withMessage('Invalid client ID format'),

  body('listingId')
    .optional()
    .isUUID()
    .withMessage('Invalid listing ID format'),
];

/**
 * Validation rules for updating an appointment
 */
const updateAppointmentRules = () => [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),

  body('appointmentDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid appointment date format')
    .toDate(),

  body('startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM format'),

  body('endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM format'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Location must be 255 characters or less'),

  body('appointmentType')
    .optional()
    .isIn(['Property Showing', 'Consultation', 'Open House', 'Inspection', 'Meeting', 'Other'])
    .withMessage('Invalid appointment type'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be 2000 characters or less'),

  body('status')
    .optional()
    .isIn(['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'])
    .withMessage('Invalid status'),

  body('clientId')
    .optional()
    .isUUID()
    .withMessage('Invalid client ID format'),

  body('listingId')
    .optional()
    .isUUID()
    .withMessage('Invalid listing ID format'),
];

/**
 * Validation rules for status update
 */
const updateStatusRules = () => [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'])
    .withMessage('Invalid status'),
];

/**
 * Validation rules for appointment ID parameter
 */
const appointmentIdRules = () => [
  param('id')
    .notEmpty()
    .withMessage('Appointment ID is required'),
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
  createAppointmentRules,
  updateAppointmentRules,
  updateStatusRules,
  appointmentIdRules,
  batchDeleteRules,
};
