// backend/src/routes/appointments.routes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const appointmentsController = require('../controllers/appointments.controller');
const { authenticate } = require('../middleware/apiKey.middleware');
const { validate } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('appointmentType').isIn(['Listing Presentation', 'Buyer Consultation', 'Property Showing', 'Open House', 'Closing', 'Inspection', 'Other']),
  body('date').isISO8601().withMessage('Invalid date'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('duration').optional().isInt({ min: 15, max: 480 })
];

const updateValidation = [
  body('title').optional().notEmpty(),
  body('date').optional().isISO8601(),
  body('startTime').optional().notEmpty()
];

// Routes
router.get('/', appointmentsController.getAppointments);
router.get('/:id', appointmentsController.getAppointment);
router.post('/', createValidation, validate, appointmentsController.createAppointment);
router.put('/:id', updateValidation, validate, appointmentsController.updateAppointment);
router.post('/:id/cancel', appointmentsController.cancelAppointment);
router.post('/:id/complete', appointmentsController.markComplete);

// Archive and Delete endpoints - Added for health dashboard testing
// Archive endpoint: Soft deletes by setting status to 'cancelled'
router.put('/:id/archive', appointmentsController.archiveAppointment || appointmentsController.cancelAppointment);
// Delete endpoint: Hard delete
router.delete('/:id', appointmentsController.deleteAppointment);

module.exports = router;