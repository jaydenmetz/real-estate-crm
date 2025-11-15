// backend/src/routes/appointments.routes.js

const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const appointmentsController = require('../controllers');
const { authenticate } = require('../../../middleware/apiKey.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const { validateAppointmentRules } = require('../../../middleware/businessRules.middleware');
const {
  canAccessScope,
  requireOwnership,
  requireModifyPermission,
  requireDeletePermission
} = require('../../../middleware/authorization.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('appointmentType').optional().isIn(['Listing Presentation', 'Buyer Consultation', 'Property Showing', 'Open House', 'Closing', 'Inspection', 'Other', 'meeting']),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('duration').optional().isInt({ min: 15, max: 480 }),
];

const updateValidation = [
  body('title').optional().notEmpty(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('status').optional().isString(),
];

// Routes with Phase 2 authorization + INHERITED PRIVACY
router.get('/', canAccessScope, appointmentsController.getAppointments); // Filters out appointments linked to private leads
router.get('/:id', requireOwnership('appointment'), appointmentsController.getAppointment); // Checks inherited privacy
router.post('/', createValidation, validate, validateAppointmentRules, appointmentsController.createAppointment);
router.put('/:id', updateValidation, validate, requireModifyPermission('appointment'), validateAppointmentRules, appointmentsController.updateAppointment);
router.post('/:id/cancel', requireModifyPermission('appointment'), appointmentsController.cancelAppointment);
router.post('/:id/complete', requireModifyPermission('appointment'), appointmentsController.markComplete);

// Archive and Delete endpoints
router.put('/:id/archive', requireModifyPermission('appointment'), appointmentsController.archiveAppointment);
router.delete('/:id', requireDeletePermission('appointment'), appointmentsController.deleteAppointment);
// Batch delete endpoint: Delete multiple archived appointments
router.post(
  '/batch-delete',
  body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),
  body('ids.*').isString().withMessage('Each ID must be a string'),
  validate,
  appointmentsController.batchDeleteAppointments,
);

module.exports = router;
