// backend/src/routes/appointments.routes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const appointmentsController = require('../controllers/appointments.controller');
const { authenticate } = require('../middleware/apiKey.middleware');
const { requirePermission } = require('../middleware/auth.middleware');
const handleValidationErrors = require('../middleware/validation.middleware');

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
router.get('/', requirePermission('appointments'), appointmentsController.getAppointments);
router.get('/:id', requirePermission('appointments'), appointmentsController.getAppointment);
router.post('/', requirePermission('appointments'), createValidation, handleValidationErrors, appointmentsController.createAppointment);
router.put('/:id', requirePermission('appointments'), updateValidation, handleValidationErrors, appointmentsController.updateAppointment);
router.post('/:id/cancel', requirePermission('appointments'), appointmentsController.cancelAppointment);
router.post('/:id/complete', requirePermission('appointments'), appointmentsController.markComplete);

module.exports = router;