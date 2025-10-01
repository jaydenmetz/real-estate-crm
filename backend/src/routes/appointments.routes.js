// backend/src/routes/appointments.routes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const appointmentsController = require('../controllers/appointments.controller');
const { authenticate } = require('../middleware/apiKey.middleware');
const { validate } = require('../middleware/validation.middleware');
const { validateAppointmentRules } = require('../middleware/businessRules.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('appointmentType').optional().isIn(['Listing Presentation', 'Buyer Consultation', 'Property Showing', 'Open House', 'Closing', 'Inspection', 'Other', 'meeting']),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('duration').optional().isInt({ min: 15, max: 480 })
];

const updateValidation = [
  body('title').optional().notEmpty(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('status').optional().isString()
];

// Routes
router.get('/', appointmentsController.getAppointments);
router.get('/:id', appointmentsController.getAppointment);
router.post('/', createValidation, validate, validateAppointmentRules, appointmentsController.createAppointment);
router.put('/:id', updateValidation, validate, validateAppointmentRules, appointmentsController.updateAppointment);
router.post('/:id/cancel', appointmentsController.cancelAppointment);
router.post('/:id/complete', appointmentsController.markComplete);

// Archive and Delete endpoints - Added for health dashboard testing
// Archive endpoint: Soft deletes by setting status to 'cancelled'
router.put('/:id/archive', appointmentsController.archiveAppointment);
// Delete endpoint: Hard delete
router.delete('/:id', appointmentsController.deleteAppointment);
// Batch delete endpoint: Delete multiple archived appointments
router.post('/batch-delete',
  body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),
  body('ids.*').isString().withMessage('Each ID must be a string'),
  validate,
  appointmentsController.batchDeleteAppointments
);

module.exports = router;