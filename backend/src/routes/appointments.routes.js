// backend/src/routes/appointments.routes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const appointmentsController = require('../controllers/appointments.controller');
const { authenticateAny } = require('../middleware/combinedAuth.middleware');
const { validate } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticateAny);

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

module.exports = router;